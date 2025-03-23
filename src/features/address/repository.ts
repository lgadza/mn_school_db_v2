import { IAddressRepository } from "./interfaces/services";
import { AddressInterface, AddressLinkInterface } from "./interfaces";
import Address from "./model";
import AddressLink from "./address-link.model";
import { Transaction, Op, WhereOptions } from "sequelize";
import {
  AddressListQueryParams,
  CreateAddressDTO,
  UpdateAddressDTO,
  CreateAddressLinkDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import db from "@/config/database";

export class AddressRepository implements IAddressRepository {
  /**
   * Find an address by ID
   */
  public async findAddressById(id: string): Promise<AddressInterface | null> {
    try {
      return await Address.findByPk(id);
    } catch (error) {
      logger.error("Error finding address by ID:", error);
      throw new DatabaseError("Database error while finding address", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, addressId: id },
      });
    }
  }

  /**
   * Create a new address
   */
  public async createAddress(
    addressData: CreateAddressDTO,
    transaction?: Transaction
  ): Promise<AddressInterface> {
    try {
      return await Address.create(addressData as any, { transaction });
    } catch (error) {
      logger.error("Error creating address:", error);
      throw new DatabaseError("Database error while creating address", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update an address
   */
  public async updateAddress(
    id: string,
    addressData: UpdateAddressDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Address.update(addressData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating address:", error);
      throw new DatabaseError("Database error while updating address", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, addressId: id },
      });
    }
  }

  /**
   * Delete an address
   */
  public async deleteAddress(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Address.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting address:", error);
      throw new DatabaseError("Database error while deleting address", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, addressId: id },
      });
    }
  }

  /**
   * Get address list with filtering and pagination
   */
  public async getAddressList(params: AddressListQueryParams): Promise<{
    addresses: AddressInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        city,
        province,
        country,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (city) {
        where.city = { [Op.iLike]: `%${city}%` };
      }

      if (province) {
        where.province = { [Op.iLike]: `%${province}%` };
      }

      if (country) {
        where.country = { [Op.iLike]: `%${country}%` };
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { buildingNumber: { [Op.iLike]: `%${search}%` } },
            { street: { [Op.iLike]: `%${search}%` } },
            { city: { [Op.iLike]: `%${search}%` } },
            { province: { [Op.iLike]: `%${search}%` } },
            { country: { [Op.iLike]: `%${search}%` } },
            { addressLine2: { [Op.iLike]: `%${search}%` } },
            { postalCode: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get addresses and total count
      const { count, rows } = await Address.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
      });

      return {
        addresses: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting address list:", error);
      throw new DatabaseError("Database error while getting address list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find addresses for an entity
   */
  public async findAddressesByEntity(
    entityId: string,
    entityType: string
  ): Promise<(AddressInterface & { link?: AddressLinkInterface })[]> {
    try {
      const addressLinks = await AddressLink.findAll({
        where: {
          entityId,
          entityType,
        },
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });

      return addressLinks.map((link: any) => {
        const address = link.address;
        return {
          ...address.get(),
          link: link.get(),
        };
      });
    } catch (error) {
      logger.error("Error finding addresses for entity:", error);
      throw new DatabaseError("Database error while finding entity addresses", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          entityId,
          entityType,
        },
      });
    }
  }

  /**
   * Find a specific address type for an entity
   */
  public async findAddressByType(
    entityId: string,
    entityType: string,
    addressType: string
  ): Promise<(AddressInterface & { link?: AddressLinkInterface }) | null> {
    try {
      const addressLink = await AddressLink.findOne({
        where: {
          entityId,
          entityType,
          addressType,
        },
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });

      if (!addressLink) {
        return null;
      }

      const address = (addressLink as any).address;
      return {
        ...address.get(),
        link: addressLink.get(),
      };
    } catch (error) {
      logger.error("Error finding address by type:", error);
      throw new DatabaseError("Database error while finding address by type", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          entityId,
          entityType,
          addressType,
        },
      });
    }
  }

  /**
   * Create an address link
   */
  public async createAddressLink(
    linkData: CreateAddressLinkDTO,
    transaction?: Transaction
  ): Promise<AddressLinkInterface> {
    try {
      const useTransaction = transaction || (await db.sequelize.transaction());

      try {
        // If this is a primary address, ensure any other addresses of the same type are not primary
        if (linkData.isPrimary) {
          await AddressLink.update(
            { isPrimary: false },
            {
              where: {
                entityId: linkData.entityId,
                entityType: linkData.entityType,
                addressType: linkData.addressType,
                isPrimary: true,
              },
              transaction: useTransaction,
            }
          );
        }

        // Create the new address link
        const newLink = await AddressLink.create(
          {
            addressId: linkData.addressId,
            entityId: linkData.entityId,
            entityType: linkData.entityType,
            addressType: linkData.addressType,
            isPrimary: linkData.isPrimary || false,
          },
          { transaction: useTransaction }
        );

        // Commit the transaction if we started it
        if (!transaction) {
          await useTransaction.commit();
        }

        return newLink;
      } catch (error) {
        // Rollback the transaction if we started it
        if (!transaction) {
          await useTransaction.rollback();
        }
        throw error;
      }
    } catch (error) {
      logger.error("Error creating address link:", error);
      throw new DatabaseError("Database error while creating address link", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, linkData },
      });
    }
  }

  /**
   * Update an address link
   */
  public async updateAddressLink(
    id: string,
    isPrimary: boolean,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const useTransaction = transaction || (await db.sequelize.transaction());

      try {
        // Get the current link to retrieve entity info
        const currentLink = await AddressLink.findByPk(id);
        if (!currentLink) {
          if (!transaction) {
            await useTransaction.rollback();
          }
          return false;
        }

        // If setting as primary, update any other primary addresses of this type to non-primary
        if (isPrimary) {
          await AddressLink.update(
            { isPrimary: false },
            {
              where: {
                entityId: currentLink.entityId,
                entityType: currentLink.entityType,
                addressType: currentLink.addressType,
                isPrimary: true,
                id: { [Op.ne]: id },
              },
              transaction: useTransaction,
            }
          );
        }

        // Update the specified link
        const [updated] = await AddressLink.update(
          { isPrimary },
          {
            where: { id },
            transaction: useTransaction,
          }
        );

        // Commit the transaction if we started it
        if (!transaction) {
          await useTransaction.commit();
        }

        return updated > 0;
      } catch (error) {
        // Rollback the transaction if we started it
        if (!transaction) {
          await useTransaction.rollback();
        }
        throw error;
      }
    } catch (error) {
      logger.error("Error updating address link:", error);
      throw new DatabaseError("Database error while updating address link", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, linkId: id },
      });
    }
  }

  /**
   * Delete an address link
   */
  public async deleteAddressLink(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await AddressLink.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting address link:", error);
      throw new DatabaseError("Database error while deleting address link", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, linkId: id },
      });
    }
  }

  /**
   * Find an address link by ID
   */
  public async findAddressLinkById(
    id: string
  ): Promise<(AddressLinkInterface & { address?: AddressInterface }) | null> {
    try {
      const link = await AddressLink.findByPk(id, {
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });

      return link as any;
    } catch (error) {
      logger.error("Error finding address link by ID:", error);
      throw new DatabaseError("Database error while finding address link", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, linkId: id },
      });
    }
  }

  /**
   * Get address links for an entity
   */
  public async getAddressLinks(
    entityId: string,
    entityType: string
  ): Promise<(AddressLinkInterface & { address?: AddressInterface })[]> {
    try {
      const links = await AddressLink.findAll({
        where: {
          entityId,
          entityType,
        },
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });

      return links as any;
    } catch (error) {
      logger.error("Error getting address links:", error);
      throw new DatabaseError("Database error while getting address links", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          entityId,
          entityType,
        },
      });
    }
  }

  /**
   * Find primary address for an entity and type
   */
  public async findPrimaryAddress(
    entityId: string,
    entityType: string,
    addressType?: string
  ): Promise<(AddressInterface & { link?: AddressLinkInterface }) | null> {
    try {
      const whereClause: any = {
        entityId,
        entityType,
        isPrimary: true,
      };

      if (addressType) {
        whereClause.addressType = addressType;
      }

      const addressLink = await AddressLink.findOne({
        where: whereClause,
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });

      if (!addressLink) {
        return null;
      }

      const address = (addressLink as any).address;
      return {
        ...address.get(),
        link: addressLink.get(),
      };
    } catch (error) {
      logger.error("Error finding primary address:", error);
      throw new DatabaseError("Database error while finding primary address", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          entityId,
          entityType,
          addressType,
        },
      });
    }
  }

  /**
   * Check if an address is in use by any entity
   */
  public async isAddressInUse(addressId: string): Promise<boolean> {
    try {
      const count = await AddressLink.count({
        where: { addressId },
      });

      return count > 0;
    } catch (error) {
      logger.error("Error checking if address is in use:", error);
      throw new DatabaseError("Database error while checking address usage", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, addressId },
      });
    }
  }
}

// Create and export repository instance
export default new AddressRepository();

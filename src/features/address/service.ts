import { IAddressService, IAddressRepository } from "./interfaces/services";
import {
  AddressDetailDTO,
  CreateAddressDTO,
  UpdateAddressDTO,
  PaginatedAddressListDTO,
  AddressListQueryParams,
  AddressLinkDTO,
  CreateAddressLinkDTO,
  AddressDTOMapper,
} from "./dto";
import repository from "./repository";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import db from "@/config/database";
import cache from "@/common/utils/cache/cacheUtil";

export class AddressService implements IAddressService {
  private repository: IAddressRepository;
  private readonly CACHE_PREFIX = "address:";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(repository: IAddressRepository) {
    this.repository = repository;
  }

  /**
   * Get address by ID
   */
  public async getAddressById(id: string): Promise<AddressDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedAddress = await cache.get(cacheKey);

      if (cachedAddress) {
        return JSON.parse(cachedAddress);
      }

      // Get from database if not in cache
      const address = await this.repository.findAddressById(id);
      if (!address) {
        throw new NotFoundError(`Address with ID ${id} not found`);
      }

      // Map to DTO
      const addressDTO = AddressDTOMapper.toDetailDTO(address);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(addressDTO), this.CACHE_TTL);

      return addressDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getAddressById service:", error);
      throw new AppError("Failed to get address");
    }
  }

  /**
   * Create a new address
   */
  public async createAddress(
    addressData: CreateAddressDTO
  ): Promise<AddressDetailDTO> {
    try {
      // Validate the postal code format if provided
      if (addressData.postalCode) {
        const isValidPostalCode = this.validatePostalCode(
          addressData.postalCode,
          addressData.country
        );
        if (!isValidPostalCode) {
          throw new BadRequestError(
            `Invalid postal code format for ${addressData.country}`
          );
        }
      }

      // Create the address
      const newAddress = await this.repository.createAddress(addressData);

      // Get the complete address
      return AddressDTOMapper.toDetailDTO(newAddress);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createAddress service:", error);
      throw new AppError("Failed to create address");
    }
  }

  /**
   * Update an address
   */
  public async updateAddress(
    id: string,
    addressData: UpdateAddressDTO
  ): Promise<AddressDetailDTO> {
    try {
      // Check if address exists
      const existingAddress = await this.repository.findAddressById(id);
      if (!existingAddress) {
        throw new NotFoundError(`Address with ID ${id} not found`);
      }

      // Validate the postal code format if provided
      if (addressData.postalCode) {
        const country = addressData.country || existingAddress.country;
        const isValidPostalCode = this.validatePostalCode(
          addressData.postalCode,
          country
        );
        if (!isValidPostalCode) {
          throw new BadRequestError(
            `Invalid postal code format for ${country}`
          );
        }
      }

      // Update address
      await this.repository.updateAddress(id, addressData);

      // Clear cache
      await this.clearAddressCache(id);

      // Get the updated address
      return this.getAddressById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateAddress service:", error);
      throw new AppError("Failed to update address");
    }
  }

  /**
   * Delete an address
   */
  public async deleteAddress(id: string): Promise<boolean> {
    try {
      // Check if address exists
      const existingAddress = await this.repository.findAddressById(id);
      if (!existingAddress) {
        throw new NotFoundError(`Address with ID ${id} not found`);
      }

      // Check if the address is in use
      const isInUse = await this.repository.isAddressInUse(id);
      if (isInUse) {
        throw new ConflictError(
          "Cannot delete address as it is linked to one or more entities"
        );
      }

      // Delete the address
      const result = await this.repository.deleteAddress(id);

      // Clear cache
      await this.clearAddressCache(id);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteAddress service:", error);
      throw new AppError("Failed to delete address");
    }
  }

  /**
   * Get paginated address list
   */
  public async getAddressList(
    params: AddressListQueryParams
  ): Promise<PaginatedAddressListDTO> {
    try {
      const { addresses, total } = await this.repository.getAddressList(params);

      // Map to DTOs
      const addressDTOs = addresses.map((address) =>
        AddressDTOMapper.toDetailDTO(address)
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        addresses: addressDTOs,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getAddressList service:", error);
      throw new AppError("Failed to get address list");
    }
  }

  /**
   * Get addresses for an entity
   */
  public async getEntityAddresses(
    entityId: string,
    entityType: string
  ): Promise<AddressLinkDTO[]> {
    try {
      const addressLinks = await this.repository.getAddressLinks(
        entityId,
        entityType
      );

      return addressLinks.map((link) => ({
        id: link.id,
        addressId: link.addressId,
        entityId: link.entityId,
        entityType: link.entityType,
        addressType: link.addressType,
        isPrimary: link.isPrimary,
        address: AddressDTOMapper.toDetailDTO(link.address!),
      }));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getEntityAddresses service:", error);
      throw new AppError("Failed to get entity addresses");
    }
  }

  /**
   * Get a specific address type for an entity
   */
  public async getEntityAddressByType(
    entityId: string,
    entityType: string,
    addressType: string
  ): Promise<AddressLinkDTO | null> {
    try {
      const addressWithLink = await this.repository.findAddressByType(
        entityId,
        entityType,
        addressType
      );

      if (!addressWithLink) {
        return null;
      }

      return {
        id: addressWithLink.link!.id,
        addressId: addressWithLink.link!.addressId,
        entityId: addressWithLink.link!.entityId,
        entityType: addressWithLink.link!.entityType,
        addressType: addressWithLink.link!.addressType,
        isPrimary: addressWithLink.link!.isPrimary,
        address: AddressDTOMapper.toDetailDTO(addressWithLink),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getEntityAddressByType service:", error);
      throw new AppError("Failed to get entity address by type");
    }
  }

  /**
   * Link an address to an entity
   */
  public async linkAddressToEntity(
    linkData: CreateAddressLinkDTO
  ): Promise<AddressLinkDTO> {
    try {
      // Check if address exists
      const address = await this.repository.findAddressById(linkData.addressId);
      if (!address) {
        throw new NotFoundError(
          `Address with ID ${linkData.addressId} not found`
        );
      }

      // Create the link
      const link = await this.repository.createAddressLink(linkData);

      // Get the complete link with address
      const linkWithAddress = await this.repository.findAddressLinkById(
        link.id
      );
      if (!linkWithAddress || !linkWithAddress.address) {
        throw new AppError("Failed to retrieve created address link");
      }

      return {
        id: linkWithAddress.id,
        addressId: linkWithAddress.addressId,
        entityId: linkWithAddress.entityId,
        entityType: linkWithAddress.entityType,
        addressType: linkWithAddress.addressType,
        isPrimary: linkWithAddress.isPrimary,
        address: AddressDTOMapper.toDetailDTO(linkWithAddress.address),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in linkAddressToEntity service:", error);
      throw new AppError("Failed to link address to entity");
    }
  }

  /**
   * Create and link a new address to an entity
   */
  public async createAndLinkAddress(
    addressData: CreateAddressDTO,
    entityId: string,
    entityType: string,
    addressType: string,
    isPrimary: boolean = false
  ): Promise<AddressLinkDTO> {
    try {
      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Create the address
        const newAddress = await this.repository.createAddress(
          addressData,
          transaction
        );

        // Create the link
        const link = await this.repository.createAddressLink(
          {
            addressId: newAddress.id,
            entityId,
            entityType,
            addressType,
            isPrimary,
          },
          transaction
        );

        // Commit the transaction
        await transaction.commit();

        // Return the address with link details
        return {
          id: link.id,
          addressId: newAddress.id,
          entityId,
          entityType,
          addressType,
          isPrimary,
          address: AddressDTOMapper.toDetailDTO(newAddress),
        };
      } catch (error) {
        // Rollback the transaction on error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createAndLinkAddress service:", error);
      throw new AppError("Failed to create and link address");
    }
  }

  /**
   * Update address link (e.g., set as primary)
   */
  public async updateAddressLink(
    id: string,
    isPrimary: boolean
  ): Promise<AddressLinkDTO> {
    try {
      // Check if link exists
      const existingLink = await this.repository.findAddressLinkById(id);
      if (!existingLink) {
        throw new NotFoundError(`Address link with ID ${id} not found`);
      }

      // Update the link
      await this.repository.updateAddressLink(id, isPrimary);

      // Get the updated link
      const updatedLink = await this.repository.findAddressLinkById(id);
      if (!updatedLink || !updatedLink.address) {
        throw new AppError("Failed to retrieve updated address link");
      }

      return {
        id: updatedLink.id,
        addressId: updatedLink.addressId,
        entityId: updatedLink.entityId,
        entityType: updatedLink.entityType,
        addressType: updatedLink.addressType,
        isPrimary: updatedLink.isPrimary,
        address: AddressDTOMapper.toDetailDTO(updatedLink.address),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateAddressLink service:", error);
      throw new AppError("Failed to update address link");
    }
  }

  /**
   * Remove address link
   */
  public async unlinkAddress(linkId: string): Promise<boolean> {
    try {
      // Check if link exists
      const existingLink = await this.repository.findAddressLinkById(linkId);
      if (!existingLink) {
        throw new NotFoundError(`Address link with ID ${linkId} not found`);
      }

      // Delete the link
      return await this.repository.deleteAddressLink(linkId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in unlinkAddress service:", error);
      throw new AppError("Failed to unlink address");
    }
  }

  /**
   * Get primary address for an entity
   */
  public async getEntityPrimaryAddress(
    entityId: string,
    entityType: string,
    addressType?: string
  ): Promise<AddressLinkDTO | null> {
    try {
      const addressWithLink = await this.repository.findPrimaryAddress(
        entityId,
        entityType,
        addressType
      );

      if (!addressWithLink) {
        return null;
      }

      return {
        id: addressWithLink.link!.id,
        addressId: addressWithLink.link!.addressId,
        entityId: addressWithLink.link!.entityId,
        entityType: addressWithLink.link!.entityType,
        addressType: addressWithLink.link!.addressType,
        isPrimary: addressWithLink.link!.isPrimary,
        address: AddressDTOMapper.toDetailDTO(addressWithLink),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getEntityPrimaryAddress service:", error);
      throw new AppError("Failed to get entity primary address");
    }
  }

  /**
   * Validate postal code format for a country
   */
  public validatePostalCode(postalCode: string, country: string): boolean {
    if (!postalCode) return true;

    // Postal code validation patterns for different countries
    const postalCodePatterns: Record<string, RegExp> = {
      US: /^\d{5}(-\d{4})?$/, // US ZIP code (5 digits, optional 4-digit extension)
      CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, // Canadian postal code
      UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, // UK postal code
      AU: /^\d{4}$/, // Australian postal code
      DE: /^\d{5}$/, // German postal code
      FR: /^\d{5}$/, // French postal code
      IT: /^\d{5}$/, // Italian postal code
      ES: /^\d{5}$/, // Spanish postal code
      // Add more countries as needed
    };

    // Normalize country code (uppercase)
    const countryCode = country.toUpperCase();

    // Check if we have a pattern for this country
    if (postalCodePatterns[countryCode]) {
      return postalCodePatterns[countryCode].test(postalCode);
    }

    // For countries without specific validation, accept any non-empty string
    return true;
  }

  /**
   * Clear address cache
   */
  private async clearAddressCache(addressId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${addressId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new AddressService(repository);

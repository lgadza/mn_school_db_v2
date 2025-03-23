import { Request, Response } from "express";
import { IAddressService } from "./interfaces/services";
import addressService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class AddressController {
  private service: IAddressService;

  constructor(service: IAddressService) {
    this.service = service;
  }

  /**
   * Get address by ID
   */
  public getAddressById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getAddressById(id);

      ResponseUtil.sendSuccess(res, result, "Address retrieved successfully");
    } catch (error) {
      logger.error("Error in getAddressById controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving address",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create a new address
   */
  public createAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const addressData = req.body;
      const result = await this.service.createAddress(addressData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Address created successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createAddress controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating address",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update an address
   */
  public updateAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const addressData = req.body;
      const result = await this.service.updateAddress(id, addressData);

      ResponseUtil.sendSuccess(res, result, "Address updated successfully");
    } catch (error) {
      logger.error("Error in updateAddress controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating address",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Delete an address
   */
  public deleteAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteAddress(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Address deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteAddress controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error deleting address",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get address list
   */
  public getAddressList = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const params = req.query;
      const result = await this.service.getAddressList({
        page: params.page ? parseInt(params.page as string) : undefined,
        limit: params.limit ? parseInt(params.limit as string) : undefined,
        search: params.search as string,
        sortBy: params.sortBy as string,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
        city: params.city as string,
        province: params.province as string,
        country: params.country as string,
      });

      ResponseUtil.sendSuccess(res, result, "Addresses retrieved successfully");
    } catch (error) {
      logger.error("Error in getAddressList controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving addresses",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get entity addresses
   */
  public getEntityAddresses = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { entityId, entityType } = req.params;
      const result = await this.service.getEntityAddresses(
        entityId,
        entityType
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Entity addresses retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getEntityAddresses controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving entity addresses",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get entity address by type
   */
  public getEntityAddressByType = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { entityId, entityType, addressType } = req.params;
      const result = await this.service.getEntityAddressByType(
        entityId,
        entityType,
        addressType
      );

      if (!result) {
        ResponseUtil.sendNotFound(
          res,
          `No ${addressType} address found for this entity`
        );
        return;
      }

      ResponseUtil.sendSuccess(
        res,
        result,
        "Entity address retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getEntityAddressByType controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving entity address by type",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Link address to entity
   */
  public linkAddressToEntity = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const linkData = req.body;
      const result = await this.service.linkAddressToEntity(linkData);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Address linked to entity successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in linkAddressToEntity controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error linking address to entity",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Create and link address
   */
  public createAndLinkAddress = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { entityId, entityType, addressType } = req.params;
      const { address, isPrimary } = req.body;

      const result = await this.service.createAndLinkAddress(
        address,
        entityId,
        entityType,
        addressType,
        isPrimary
      );

      ResponseUtil.sendSuccess(
        res,
        result,
        "Address created and linked successfully",
        HttpStatus.CREATED
      );
    } catch (error) {
      logger.error("Error in createAndLinkAddress controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error creating and linking address",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Update address link
   */
  public updateAddressLink = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { isPrimary } = req.body;

      const result = await this.service.updateAddressLink(id, isPrimary);

      ResponseUtil.sendSuccess(
        res,
        result,
        "Address link updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateAddressLink controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error updating address link",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Unlink address
   */
  public unlinkAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.unlinkAddress(id);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Address unlinked successfully"
      );
    } catch (error) {
      logger.error("Error in unlinkAddress controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error unlinking address",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get entity primary address
   */
  public getEntityPrimaryAddress = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { entityId, entityType } = req.params;
      const addressType = req.query.addressType as string | undefined;

      const result = await this.service.getEntityPrimaryAddress(
        entityId,
        entityType,
        addressType
      );

      if (!result) {
        ResponseUtil.sendNotFound(
          res,
          "No primary address found for this entity"
        );
        return;
      }

      ResponseUtil.sendSuccess(
        res,
        result,
        "Primary address retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getEntityPrimaryAddress controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error retrieving entity primary address",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Validate a postal code
   */
  public validatePostalCode = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { postalCode, country } = req.query;

      if (!postalCode || !country) {
        ResponseUtil.sendBadRequest(
          res,
          "Postal code and country are required"
        );
        return;
      }

      const isValid = this.service.validatePostalCode(
        postalCode as string,
        country as string
      );

      ResponseUtil.sendSuccess(
        res,
        { isValid },
        isValid
          ? "Postal code format is valid"
          : "Postal code format is invalid"
      );
    } catch (error) {
      logger.error("Error in validatePostalCode controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error validating postal code",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };
}

// Create and export controller instance
export default new AddressController(addressService);

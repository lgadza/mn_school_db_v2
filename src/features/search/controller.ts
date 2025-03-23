import { Request, Response } from "express";
import { ISearchService } from "./interfaces/services";
import searchService from "./service";
import ResponseUtil, {
  HttpStatus,
} from "@/common/utils/responses/responseUtil";
import logger from "@/common/utils/logging/logger";
import { AppError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class SearchController {
  private service: ISearchService;

  constructor(service: ISearchService) {
    this.service = service;
  }

  /**
   * Perform a global search across all entities
   */
  public globalSearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;

      if (!q || typeof q !== "string") {
        ResponseUtil.sendBadRequest(res, "Search query is required");
        return;
      }

      // Extract and process query parameters
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        entityTypes: req.query.types
          ? (req.query.types as string).split(",")
          : undefined,
        fuzzy: req.query.fuzzy === "true",
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
        filters: this.parseFilters(req.query.filters as string),
      };

      const result = await this.service.globalSearch(q, params);

      ResponseUtil.sendSuccess(res, result, `Search results for "${q}"`);
    } catch (error) {
      logger.error("Error in globalSearch controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error performing search",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Search within specific entity types
   */
  public searchEntities = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { q } = req.query;
      const { entityTypes } = req.params;

      if (!q || typeof q !== "string") {
        ResponseUtil.sendBadRequest(res, "Search query is required");
        return;
      }

      if (!entityTypes) {
        ResponseUtil.sendBadRequest(res, "Entity types are required");
        return;
      }

      // Extract entity types from path parameter
      const types = entityTypes.split(",");

      // Extract and process query parameters
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        fuzzy: req.query.fuzzy === "true",
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
        filters: this.parseFilters(req.query.filters as string),
      };

      const result = await this.service.searchEntities(types, q, params);

      ResponseUtil.sendSuccess(
        res,
        result,
        `Search results for "${q}" in ${types.join(", ")}`
      );
    } catch (error) {
      logger.error("Error in searchEntities controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error performing entity search",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Get search suggestions
   */
  public getSuggestions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { q, types } = req.query;

      if (!q || typeof q !== "string") {
        ResponseUtil.sendBadRequest(res, "Search query is required");
        return;
      }

      // Parse entity types if provided
      const entityTypes = types ? (types as string).split(",") : undefined;

      const result = await this.service.getSuggestions(q, entityTypes);

      ResponseUtil.sendSuccess(res, result, `Suggestions for "${q}"`);
    } catch (error) {
      logger.error("Error in getSuggestions controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error getting search suggestions",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Index or reindex an entity
   */
  public indexEntity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityType, entityId } = req.params;

      if (!entityType || !entityId) {
        ResponseUtil.sendBadRequest(res, "Entity type and ID are required");
        return;
      }

      const result = await this.service.indexEntity(entityType, entityId);

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        `Entity ${entityId} indexed successfully`
      );
    } catch (error) {
      logger.error("Error in indexEntity controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error indexing entity",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Rebuild all search indexes
   */
  public rebuildIndexes = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.service.rebuildIndexes();

      ResponseUtil.sendSuccess(
        res,
        { success: result },
        "Search indexes rebuilt successfully"
      );
    } catch (error) {
      logger.error("Error in rebuildIndexes controller:", error);
      if (error instanceof AppError) {
        ResponseUtil.sendError(res, error.message, error.httpCode, {
          code: error.metadata.code,
        });
      } else {
        ResponseUtil.sendError(
          res,
          "Error rebuilding search indexes",
          HttpStatus.INTERNAL_SERVER_ERROR,
          { code: ErrorCode.GEN_INTERNAL_ERROR }
        );
      }
    }
  };

  /**
   * Parse filters from query string
   */
  private parseFilters(
    filtersStr: string | undefined
  ): Record<string, any> | undefined {
    if (!filtersStr) {
      return undefined;
    }

    try {
      return JSON.parse(filtersStr);
    } catch (error) {
      logger.warn("Error parsing filters:", error);
      return undefined;
    }
  }
}

// Create and export controller instance
export default new SearchController(searchService);

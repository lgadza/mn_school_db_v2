import {
  RentalRuleDetailDTO,
  RentalRuleDTOMapper,
  CreateRentalRuleDTO,
  UpdateRentalRuleDTO,
  RentalRuleListQueryParams,
  PaginatedRentalRuleListDTO,
} from "./dto";
import rulesRepository from "./repository";
import RentalRule from "./model";
import logger from "@/common/utils/logging/logger";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/common/utils/errors/errorUtils";
import cache from "@/common/utils/cache/cacheUtil";
import db from "@/config/database";
import School from "../../schools/model";

export class RentalRuleService {
  private readonly CACHE_PREFIX = "rentalRule:";
  private readonly CACHE_TTL = 600; // 10 minutes

  /**
   * Get rule by ID
   */
  public async getRuleById(id: string): Promise<RentalRuleDetailDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${id}`;
      const cachedRule = await cache.get(cacheKey);

      if (cachedRule) {
        return JSON.parse(cachedRule);
      }

      // Get from database if not in cache
      const rule = await rulesRepository.findRuleById(id);
      if (!rule) {
        throw new NotFoundError(`Rental rule with ID ${id} not found`);
      }

      // Map to DTO
      const ruleDTO = RentalRuleDTOMapper.toDetailDTO(rule);

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(ruleDTO), this.CACHE_TTL);

      return ruleDTO;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in getRuleById service:", error);
      throw new AppError("Failed to get rental rule");
    }
  }

  /**
   * Create a new rental rule
   */
  public async createRule(
    ruleData: CreateRentalRuleDTO
  ): Promise<RentalRuleDetailDTO> {
    try {
      // Validate data
      await this.validateRuleData(ruleData);

      // Verify that school exists
      const school = await School.findByPk(ruleData.schoolId);
      if (!school) {
        throw new BadRequestError(
          `School with ID ${ruleData.schoolId} not found`
        );
      }

      // Create the rule
      const newRule = await rulesRepository.createRule(ruleData);

      // Map to DTO
      return RentalRuleDTOMapper.toDetailDTO(newRule);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in createRule service:", error);
      throw new AppError("Failed to create rental rule");
    }
  }

  /**
   * Update a rental rule
   */
  public async updateRule(
    id: string,
    ruleData: UpdateRentalRuleDTO
  ): Promise<RentalRuleDetailDTO> {
    try {
      // Check if rule exists
      const existingRule = await rulesRepository.findRuleById(id);
      if (!existingRule) {
        throw new NotFoundError(`Rental rule with ID ${id} not found`);
      }

      // Validate data
      await this.validateRuleData(ruleData);

      // Update rule
      await rulesRepository.updateRule(id, ruleData);

      // Clear cache
      await this.clearRuleCache(id);

      // Get the updated rule
      return this.getRuleById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in updateRule service:", error);
      throw new AppError("Failed to update rental rule");
    }
  }

  /**
   * Delete a rental rule
   */
  public async deleteRule(id: string): Promise<boolean> {
    try {
      // Check if rule exists
      const existingRule = await rulesRepository.findRuleById(id);
      if (!existingRule) {
        throw new NotFoundError(`Rental rule with ID ${id} not found`);
      }

      // Delete the rule
      const result = await rulesRepository.deleteRule(id);

      // Clear cache
      await this.clearRuleCache(id);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in deleteRule service:", error);
      throw new AppError("Failed to delete rental rule");
    }
  }

  /**
   * Get paginated rule list
   */
  public async getRuleList(
    params: RentalRuleListQueryParams
  ): Promise<PaginatedRentalRuleListDTO> {
    try {
      const { rules, total } = await rulesRepository.getRuleList(params);

      // Map to DTOs
      const ruleDTOs = rules.map((rule) =>
        RentalRuleDTOMapper.toDetailDTO(rule)
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        rules: ruleDTOs,
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
      logger.error("Error in getRuleList service:", error);
      throw new AppError("Failed to get rental rule list");
    }
  }

  /**
   * Get rules by school
   */
  public async getRulesBySchool(
    schoolId: string,
    params: RentalRuleListQueryParams = {}
  ): Promise<PaginatedRentalRuleListDTO> {
    try {
      // Check if school exists
      const school = await School.findByPk(schoolId);
      if (!school) {
        throw new NotFoundError(`School with ID ${schoolId} not found`);
      }

      const { rules, total } = await rulesRepository.findRulesBySchool(
        schoolId,
        params
      );

      // Map to DTOs
      const ruleDTOs = rules.map((rule) =>
        RentalRuleDTOMapper.toDetailDTO(rule)
      );

      // Create pagination metadata
      const { page = 1, limit = 10 } = params;
      const totalPages = Math.ceil(total / limit);

      return {
        rules: ruleDTOs,
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
      logger.error("Error in getRulesBySchool service:", error);
      throw new AppError("Failed to get school rental rules");
    }
  }

  /**
   * Validate rental rule data
   */
  public async validateRuleData(
    ruleData: CreateRentalRuleDTO | UpdateRentalRuleDTO
  ): Promise<boolean> {
    // Validate name if provided
    if ("name" in ruleData && ruleData.name) {
      if (ruleData.name.length < 1 || ruleData.name.length > 100) {
        throw new BadRequestError("Name must be between 1 and 100 characters");
      }
    }

    // Validate rentalPeriodDays if provided
    if (
      "rentalPeriodDays" in ruleData &&
      ruleData.rentalPeriodDays !== undefined
    ) {
      if (ruleData.rentalPeriodDays < 1) {
        throw new BadRequestError("Rental period must be at least 1 day");
      }
    }

    // Validate maxBooksPerStudent if provided
    if (
      "maxBooksPerStudent" in ruleData &&
      ruleData.maxBooksPerStudent !== undefined
    ) {
      if (ruleData.maxBooksPerStudent < 1) {
        throw new BadRequestError(
          "Maximum books per student must be at least 1"
        );
      }
    }

    // Validate lateFeePerDay if provided
    if (
      "lateFeePerDay" in ruleData &&
      ruleData.lateFeePerDay !== undefined &&
      ruleData.lateFeePerDay !== null
    ) {
      if (ruleData.lateFeePerDay < 0) {
        throw new BadRequestError("Late fee per day must be non-negative");
      }
    }

    // Validate renewalLimit if provided
    if (
      "renewalLimit" in ruleData &&
      ruleData.renewalLimit !== undefined &&
      ruleData.renewalLimit !== null
    ) {
      if (ruleData.renewalLimit < 0) {
        throw new BadRequestError("Renewal limit must be non-negative");
      }
    }

    return true;
  }

  /**
   * Clear rule cache
   */
  private async clearRuleCache(ruleId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${ruleId}`;
    await cache.del(cacheKey);
  }
}

// Create and export service instance
export default new RentalRuleService();

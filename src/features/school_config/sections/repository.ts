import { ISectionRepository } from "./interfaces/services";
import { SectionInterface, SectionStatistics } from "./interfaces/interfaces";
import Section from "./model";
import School from "../../schools/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import {
  SectionListQueryParams,
  CreateSectionDTO,
  UpdateSectionDTO,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class SectionRepository implements ISectionRepository {
  /**
   * Find a section by ID
   */
  public async findSectionById(id: string): Promise<SectionInterface | null> {
    try {
      return await Section.findByPk(id, {
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding section by ID:", error);
      throw new DatabaseError("Database error while finding section", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, sectionId: id },
      });
    }
  }

  /**
   * Create a new section
   */
  public async createSection(
    sectionData: CreateSectionDTO,
    transaction?: Transaction
  ): Promise<SectionInterface> {
    try {
      return await Section.create(sectionData as any, { transaction });
    } catch (error) {
      logger.error("Error creating section:", error);
      throw new DatabaseError("Database error while creating section", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a section
   */
  public async updateSection(
    id: string,
    sectionData: UpdateSectionDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Section.update(sectionData as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating section:", error);
      throw new DatabaseError("Database error while updating section", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, sectionId: id },
      });
    }
  }

  /**
   * Delete a section
   */
  public async deleteSection(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Section.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting section:", error);
      throw new DatabaseError("Database error while deleting section", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, sectionId: id },
      });
    }
  }

  /**
   * Get section list with filtering and pagination
   */
  public async getSectionList(params: SectionListQueryParams): Promise<{
    sections: SectionInterface[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        schoolId,
        color,
        capacityMin,
        capacityMax,
        active,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (color) {
        where.color = color;
      }

      // Capacity range
      if (capacityMin !== undefined || capacityMax !== undefined) {
        where.capacity = {};
        if (capacityMin !== undefined) {
          where.capacity[Op.gte] = capacityMin;
        }
        if (capacityMax !== undefined) {
          where.capacity[Op.lte] = capacityMax;
        }
      }

      // Active sections
      if (active) {
        const now = new Date();
        (where as any)[Op.and] = [
          {
            [Op.or]: [{ startDate: { [Op.lte]: now } }, { startDate: null }],
          },
          {
            [Op.or]: [{ endDate: { [Op.gte]: now } }, { endDate: null }],
          },
        ];
      }

      // Search across multiple fields
      if (search) {
        Object.assign(where, {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { details: { [Op.iLike]: `%${search}%` } },
          ],
        });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Get sections and total count
      const { count, rows } = await Section.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });

      return {
        sections: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting section list:", error);
      throw new DatabaseError("Database error while getting section list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find sections by school ID
   */
  public async findSectionsBySchool(
    schoolId: string
  ): Promise<SectionInterface[]> {
    try {
      return await Section.findAll({
        where: { schoolId },
        include: [
          {
            model: School,
            as: "school",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding sections by school:", error);
      throw new DatabaseError(
        "Database error while finding sections by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Get section statistics
   */
  public async getSectionStatistics(): Promise<SectionStatistics> {
    try {
      // Get total sections count
      const totalSections = await Section.count();

      // Get sections per school
      const sectionsPerSchoolResult = await Section.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const sectionsPerSchool: { [schoolId: string]: number } = {};
      sectionsPerSchoolResult.forEach((result: any) => {
        sectionsPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get average capacity
      const capacityResult = (await Section.findOne({
        attributes: [
          [Sequelize.fn("AVG", Sequelize.col("capacity")), "avgCapacity"],
        ],
        raw: true,
      })) as unknown as { avgCapacity: string | null };

      // Get active sections count
      const now = new Date();
      const activeSections = await Section.count({
        where: {
          [Op.and]: [
            {
              [Op.or]: [{ startDate: { [Op.lte]: now } }, { startDate: null }],
            },
            {
              [Op.or]: [{ endDate: { [Op.gte]: now } }, { endDate: null }],
            },
          ],
        },
      });

      // Get sections by color
      const sectionsByColorResult = await Section.findAll({
        attributes: [
          "color",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        where: {
          color: {
            [Op.ne]: null,
          },
        },
        group: ["color"],
        raw: true,
      });

      const sectionsByColor: { [color: string]: number } = {};
      sectionsByColorResult.forEach((result: any) => {
        if (result.color) {
          sectionsByColor[result.color] = parseInt(result.count, 10);
        }
      });

      return {
        totalSections,
        sectionsPerSchool,
        averageCapacity:
          capacityResult && capacityResult.avgCapacity
            ? parseFloat(capacityResult.avgCapacity) || 0
            : 0,
        activeSections,
        sectionsByColor,
      };
    } catch (error) {
      logger.error("Error getting section statistics:", error);
      throw new DatabaseError(
        "Database error while getting section statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Create multiple sections at once
   */
  public async createSectionsBulk(
    sectionsData: CreateSectionDTO[],
    transaction?: Transaction
  ): Promise<SectionInterface[]> {
    try {
      // Create all sections
      const createdSections = await Section.bulkCreate(sectionsData as any, {
        transaction,
      });

      // Return the created sections
      return createdSections;
    } catch (error) {
      logger.error("Error bulk creating sections:", error);
      throw new DatabaseError("Database error while bulk creating sections", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Delete multiple sections at once
   */
  public async deleteSectionsBulk(
    ids: string[],
    transaction?: Transaction
  ): Promise<number> {
    try {
      const deleted = await Section.destroy({
        where: {
          id: { [Op.in]: ids },
        },
        transaction,
      });
      return deleted;
    } catch (error) {
      logger.error("Error bulk deleting sections:", error);
      throw new DatabaseError("Database error while bulk deleting sections", {
        additionalInfo: {
          code: ErrorCode.DB_QUERY_FAILED,
          sectionIds: ids,
        },
      });
    }
  }
}

// Create and export repository instance
export default new SectionRepository();

import { IProspectRepository } from "./interfaces/services";
import { ProspectInterface, ProspectStatistics } from "./interfaces/interfaces";
import { SchoolApplicationStatistics } from "../school-applications/interfaces/interfaces";
import Prospect from "./model";
import User from "../../users/model";
import School from "../../schools/model";
import Role from "../../rbac/models/roles.model";
import Address from "../../address/model";
import SchoolApplication from "../school-applications/model";
import { Transaction, Op, WhereOptions, Sequelize } from "sequelize";
import {
  ProspectListQueryParams,
  CreateProspectDTO,
  UpdateProspectDTO,
  ProspectDTOMapper,
} from "./dto";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";

export class ProspectRepository implements IProspectRepository {
  /**
   * Find a prospect by ID
   */
  public async findProspectById(id: string): Promise<ProspectInterface | null> {
    try {
      return await Prospect.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Role,
            as: "role",
          },
          {
            model: Address,
            as: "address",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding prospect by ID:", error);
      throw new DatabaseError("Database error while finding prospect", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, prospectId: id },
      });
    }
  }

  /**
   * Find a prospect by user ID
   */
  public async findProspectByUserId(
    userId: string
  ): Promise<ProspectInterface | null> {
    try {
      return await Prospect.findOne({
        where: { userId },
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Role,
            as: "role",
          },
          {
            model: Address,
            as: "address",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding prospect by user ID:", error);
      throw new DatabaseError(
        "Database error while finding prospect by user ID",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, userId },
        }
      );
    }
  }

  /**
   * Create a new prospect
   */
  public async createProspect(
    prospectData: CreateProspectDTO,
    transaction?: Transaction
  ): Promise<ProspectInterface> {
    try {
      // Process data before saving
      const dataToSave = ProspectDTOMapper.prepareForStorage(prospectData);

      return await Prospect.create(dataToSave as any, { transaction });
    } catch (error) {
      logger.error("Error creating prospect:", error);
      throw new DatabaseError("Database error while creating prospect", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
      });
    }
  }

  /**
   * Update a prospect
   */
  public async updateProspect(
    id: string,
    prospectData: UpdateProspectDTO,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      // Process data before saving
      const dataToSave = ProspectDTOMapper.prepareForStorage(prospectData);

      const [updated] = await Prospect.update(dataToSave as any, {
        where: { id },
        transaction,
      });
      return updated > 0;
    } catch (error) {
      logger.error("Error updating prospect:", error);
      throw new DatabaseError("Database error while updating prospect", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, prospectId: id },
      });
    }
  }

  /**
   * Delete a prospect
   */
  public async deleteProspect(
    id: string,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const deleted = await Prospect.destroy({
        where: { id },
        transaction,
      });
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting prospect:", error);
      throw new DatabaseError("Database error while deleting prospect", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, prospectId: id },
      });
    }
  }

  /**
   * Get prospect list with filtering and pagination
   */
  public async getProspectList(params: ProspectListQueryParams): Promise<{
    prospects: ProspectInterface[];
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
        roleId,
        interestLevel,
        activeStatus,
        contactDateFrom,
        contactDateTo,
      } = params;

      // Build where clause
      const where: WhereOptions<any> = {};

      // Apply filters
      if (schoolId) {
        where.schoolId = schoolId;
      }

      if (roleId) {
        where.roleId = roleId;
      }

      if (interestLevel) {
        where.interestLevel = interestLevel;
      }

      if (activeStatus !== undefined) {
        where.activeStatus = activeStatus;
      }

      // Contact date range
      if (contactDateFrom || contactDateTo) {
        where.contactDate = {};
        if (contactDateFrom) {
          where.contactDate[Op.gte] = contactDateFrom;
        }
        if (contactDateTo) {
          where.contactDate[Op.lte] = contactDateTo;
        }
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Prepare include models
      const includes = [
        {
          model: User,
          as: "user",
          where: search
            ? {
                [Op.or]: [
                  { firstName: { [Op.iLike]: `%${search}%` } },
                  { lastName: { [Op.iLike]: `%${search}%` } },
                ],
              }
            : undefined,
        },
        {
          model: School,
          as: "school",
        },
        {
          model: Role,
          as: "role",
        },
        {
          model: Address,
          as: "address",
        },
      ];

      // Get prospects and total count
      const { count, rows } = await Prospect.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        include: includes,
        distinct: true, // Important for correct count with associations
      });

      return {
        prospects: rows,
        total: count,
      };
    } catch (error) {
      logger.error("Error getting prospect list:", error);
      throw new DatabaseError("Database error while getting prospect list", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, params },
      });
    }
  }

  /**
   * Find prospects by school ID
   */
  public async findProspectsBySchool(
    schoolId: string
  ): Promise<ProspectInterface[]> {
    try {
      return await Prospect.findAll({
        where: { schoolId },
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Role,
            as: "role",
          },
          {
            model: Address,
            as: "address",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding prospects by school:", error);
      throw new DatabaseError(
        "Database error while finding prospects by school",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, schoolId },
        }
      );
    }
  }

  /**
   * Find prospects by role ID
   */
  public async findProspectsByRole(
    roleId: string
  ): Promise<ProspectInterface[]> {
    try {
      return await Prospect.findAll({
        where: { roleId },
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Role,
            as: "role",
          },
          {
            model: Address,
            as: "address",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding prospects by role:", error);
      throw new DatabaseError(
        "Database error while finding prospects by role",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, roleId },
        }
      );
    }
  }

  /**
   * Find prospects by interest level
   */
  public async findProspectsByInterestLevel(
    interestLevel: string
  ): Promise<ProspectInterface[]> {
    try {
      return await Prospect.findAll({
        where: { interestLevel },
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Role,
            as: "role",
          },
          {
            model: Address,
            as: "address",
          },
        ],
      });
    } catch (error) {
      logger.error("Error finding prospects by interest level:", error);
      throw new DatabaseError(
        "Database error while finding prospects by interest level",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, interestLevel },
        }
      );
    }
  }

  /**
   * Get prospect statistics
   */
  public async getProspectStatistics(): Promise<ProspectStatistics> {
    try {
      // Get total prospects count
      const totalProspects = await Prospect.count();

      // Get active/inactive counts
      const activeProspects = await Prospect.count({
        where: { activeStatus: true },
      });
      const inactiveProspects = totalProspects - activeProspects;

      // Get prospects per school
      const prospectsPerSchoolResult = await Prospect.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const prospectsPerSchool: { [schoolId: string]: number } = {};
      prospectsPerSchoolResult.forEach((result: any) => {
        prospectsPerSchool[result.schoolId] = parseInt(result.count, 10);
      });

      // Get prospects per role
      const prospectsPerRoleResult = await Prospect.findAll({
        attributes: [
          "roleId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["roleId"],
        raw: true,
      });

      const prospectsPerRole: { [roleId: string]: number } = {};
      prospectsPerRoleResult.forEach((result: any) => {
        prospectsPerRole[result.roleId] = parseInt(result.count, 10);
      });

      // Get prospects per interest level
      const prospectsPerInterestLevelResult = await Prospect.findAll({
        attributes: [
          "interestLevel",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["interestLevel"],
        raw: true,
      });

      const prospectsPerInterestLevel: { [level: string]: number } = {};
      prospectsPerInterestLevelResult.forEach((result: any) => {
        prospectsPerInterestLevel[result.interestLevel] = parseInt(
          result.count,
          10
        );
      });

      // Get contacts by year
      const contactsByYearResult = await Prospect.findAll({
        attributes: [
          [
            Sequelize.fn("date_trunc", "year", Sequelize.col("contactDate")),
            "year",
          ],
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: [
          Sequelize.fn("date_trunc", "year", Sequelize.col("contactDate")),
        ],
        raw: true,
      });

      const contactsByYear: { [year: string]: number } = {};
      contactsByYearResult.forEach((result: any) => {
        const year = new Date(result.year).getFullYear().toString();
        contactsByYear[year] = parseInt(result.count, 10);
      });

      // Get contacts by month
      const contactsByMonthResult = await Prospect.findAll({
        attributes: [
          [
            Sequelize.fn("date_trunc", "month", Sequelize.col("contactDate")),
            "month",
          ],
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: [
          Sequelize.fn("date_trunc", "month", Sequelize.col("contactDate")),
        ],
        raw: true,
      });

      const contactsByMonth: { [month: string]: number } = {};
      contactsByMonthResult.forEach((result: any) => {
        const date = new Date(result.month);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        contactsByMonth[monthYear] = parseInt(result.count, 10);
      });

      return {
        totalProspects,
        prospectsPerSchool,
        prospectsPerRole,
        activeProspects,
        inactiveProspects,
        prospectsPerInterestLevel,
        contactsByMonth,
        contactsByYear,
      };
    } catch (error) {
      logger.error("Error getting prospect statistics:", error);
      throw new DatabaseError(
        "Database error while getting prospect statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Get prospect application statistics
   */
  public async getProspectApplicationStatistics(): Promise<SchoolApplicationStatistics> {
    try {
      const applicationCountBySchool = await SchoolApplication.findAll({
        attributes: [
          "schoolId",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["schoolId"],
        raw: true,
      });

      const applicationCountByStatus = await SchoolApplication.findAll({
        attributes: [
          "status",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["status"],
        raw: true,
      });

      // Calculate applications per month and year
      const dateStats = await SchoolApplication.findAll({
        attributes: [
          [
            Sequelize.fn(
              "date_trunc",
              "month",
              Sequelize.col("applicationDate")
            ),
            "month",
          ],
          [
            Sequelize.fn(
              "date_trunc",
              "year",
              Sequelize.col("applicationDate")
            ),
            "year",
          ],
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: [
          Sequelize.fn("date_trunc", "month", Sequelize.col("applicationDate")),
          Sequelize.fn("date_trunc", "year", Sequelize.col("applicationDate")),
        ],
        raw: true,
      });

      // Calculate multiple applications count
      const multipleApplicationsResult = await Prospect.findAndCountAll({
        where: { hasApplied: true },
        include: [
          {
            model: SchoolApplication,
            as: "applications",
            attributes: [],
            required: true,
          },
        ],
        group: ["Prospect.id"],
        having: Sequelize.literal("COUNT(applications.id) > 1"),
      });

      const multipleApplicationsCount = Array.isArray(
        multipleApplicationsResult.count
      )
        ? multipleApplicationsResult.count.length
        : (multipleApplicationsResult.count as number);

      // Format the results
      const statistics: SchoolApplicationStatistics = {
        totalApplications: await SchoolApplication.count(),
        applicationsBySchool: {},
        applicationsByStatus: {},
        applicationsPerMonth: {},
        applicationsPerYear: {},
        applicationsPerInterestLevel: {},
        averageApplicationsPerProspect: 0,
        multipleApplicationsCount,
        schoolsWithMostApplications: [],
      };

      // Process and format the raw results
      applicationCountBySchool.forEach((result: any) => {
        statistics.applicationsBySchool[result.schoolId] = parseInt(
          result.count
        );
      });

      applicationCountByStatus.forEach((result: any) => {
        statistics.applicationsByStatus[result.status] = parseInt(result.count);
      });

      // Process date statistics
      dateStats.forEach((result: any) => {
        const monthKey = new Date(result.month).toISOString().slice(0, 7);
        const yearKey = new Date(result.year).getFullYear().toString();
        statistics.applicationsPerMonth[monthKey] = parseInt(result.count);
        statistics.applicationsPerYear[yearKey] =
          (statistics.applicationsPerYear[yearKey] || 0) +
          parseInt(result.count);
      });

      // Calculate average applications per prospect
      const totalProspectsWithApplications = await Prospect.count({
        where: { hasApplied: true },
      });

      statistics.averageApplicationsPerProspect =
        totalProspectsWithApplications > 0
          ? statistics.totalApplications / totalProspectsWithApplications
          : 0;

      return statistics;
    } catch (error) {
      logger.error("Error getting prospect application statistics:", error);
      throw new DatabaseError(
        "Database error while getting application statistics",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }

  /**
   * Update prospect's hasApplied status
   */
  public async updateHasAppliedStatus(
    prospectId: string,
    hasApplied: boolean,
    transaction?: Transaction
  ): Promise<boolean> {
    try {
      const [updated] = await Prospect.update(
        { hasApplied },
        {
          where: { id: prospectId },
          transaction,
        }
      );
      return updated > 0;
    } catch (error) {
      logger.error("Error updating prospect hasApplied status:", error);
      throw new DatabaseError(
        "Database error while updating prospect application status",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, prospectId },
        }
      );
    }
  }

  /**
   * Get prospects who have applied to multiple schools
   */
  public async getProspectsWithMultipleApplications(): Promise<
    ProspectInterface[]
  > {
    try {
      // Use subquery approach to find prospects with multiple applications
      const prospectsWithMultipleApps = await Prospect.findAll({
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: School,
            as: "school",
          },
          {
            model: Role,
            as: "role",
          },
          {
            model: Address,
            as: "address",
          },
          {
            model: SchoolApplication,
            as: "applications",
            required: true,
            attributes: [],
          },
        ],
        group: ["Prospect.id", "user.id", "school.id", "role.id", "address.id"],
        having: Sequelize.literal("COUNT(applications.id) > 1"),
      });

      return prospectsWithMultipleApps;
    } catch (error) {
      logger.error(
        "Error getting prospects with multiple applications:",
        error
      );
      throw new DatabaseError(
        "Database error while getting prospects with multiple applications",
        {
          additionalInfo: { code: ErrorCode.DB_QUERY_FAILED },
        }
      );
    }
  }
}

// Create and export repository instance
export default new ProspectRepository();

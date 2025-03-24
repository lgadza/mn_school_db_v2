import { ISearchRepository } from "./interfaces/services";
import { SearchQueryParams } from "./dto";
import { Op, WhereOptions, QueryTypes, Sequelize } from "sequelize"; // Add QueryTypes import
import School from "../schools/model";
import Address from "../address/model";
import User from "../users/model";
import Book from "../library/books/model";
import BookLoan from "../library/loans/model";
import RentalRule from "../library/rules/model";
import logger from "@/common/utils/logging/logger";
import { DatabaseError } from "@/common/utils/errors/errorUtils";
import { ErrorCode } from "@/common/utils/errors/errorCodes";
import db from "@/config/database"; // Import database for direct query if needed

export class SearchRepository implements ISearchRepository {
  /**
   * Search schools
   */
  public async searchSchools(
    query: string,
    params: SearchQueryParams
  ): Promise<{
    results: any[];
    count: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "relevance",
        sortOrder = "desc",
        filters = {},
      } = params;

      // Build base where clause for the search
      const searchCondition = this.buildSchoolSearchCondition(query);

      // Add any additional filters
      const whereClause = {
        ...searchCondition,
        ...this.applyFilters(filters),
      };

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Determine sort field and order
      const order = this.determineSchoolSortOrder(sortBy, sortOrder);

      // Execute the search query
      const { rows, count } = await School.findAndCountAll({
        where: whereClause,
        order,
        limit,
        offset,
        include: [
          {
            model: Address,
            as: "address",
          },
        ],
      });

      return {
        results: rows,
        count,
      };
    } catch (error) {
      logger.error("Error searching schools:", error);
      throw new DatabaseError("Database error while searching schools", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, query },
      });
    }
  }

  /**
   * Search addresses
   */
  public async searchAddresses(
    query: string,
    params: SearchQueryParams
  ): Promise<{
    results: any[];
    count: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "relevance",
        sortOrder = "desc",
        filters = {},
      } = params;

      // Build base where clause for the search
      const searchCondition = this.buildAddressSearchCondition(query);

      // Add any additional filters
      const whereClause = {
        ...searchCondition,
        ...this.applyFilters(filters),
      };

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Determine sort field and order
      const order = this.determineAddressSortOrder(sortBy, sortOrder);

      // Execute the search query
      const { rows, count } = await Address.findAndCountAll({
        where: whereClause,
        order,
        limit,
        offset,
      });

      return {
        results: rows,
        count,
      };
    } catch (error) {
      logger.error("Error searching addresses:", error);
      throw new DatabaseError("Database error while searching addresses", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, query },
      });
    }
  }

  /**
   * Search users
   */
  public async searchUsers(
    query: string,
    params: SearchQueryParams
  ): Promise<{
    results: any[];
    count: number;
  }> {
    try {
      logger.debug(`Searching users with query: ${query}`);

      const {
        page = 1,
        limit = 10,
        sortBy = "relevance",
        sortOrder = "desc",
        filters = {},
      } = params;

      // Build base where clause for the search
      const searchCondition = this.buildUserSearchCondition(query);

      logger.debug(`User search condition: ${JSON.stringify(searchCondition)}`);

      // Add any additional filters
      const whereClause = {
        ...searchCondition,
        ...this.applyFilters(filters),
      };

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Determine sort field and order
      const order = this.determineUserSortOrder(sortBy, sortOrder);

      // Check if User model exists
      if (!User) {
        logger.warn("User model not found, using direct database query");

        // Fallback to direct database query if User model doesn't exist
        const searchQuery = `
          SELECT * FROM users 
          WHERE 
            "firstName" ILIKE $1 OR 
            "lastName" ILIKE $1 OR 
            "email" ILIKE $1 OR 
            "username" ILIKE $1 OR
            "phoneNumber" ILIKE $1
          LIMIT $2 OFFSET $3
        `;

        const countQuery = `
          SELECT COUNT(*) as count FROM users 
          WHERE 
            "firstName" ILIKE $1 OR 
            "lastName" ILIKE $1 OR 
            "email" ILIKE $1 OR 
            "username" ILIKE $1 OR
            "phoneNumber" ILIKE $1
        `;

        const searchPattern = `%${query}%`;

        // Fix the type issue with QueryTypes
        const [rows, countResult] = await Promise.all([
          db.sequelize.query(searchQuery, {
            replacements: [searchPattern, limit, offset],
            type: QueryTypes.SELECT, // Use imported QueryTypes
          }),
          db.sequelize.query(countQuery, {
            replacements: [searchPattern],
            type: QueryTypes.SELECT, // Use imported QueryTypes
          }),
        ]);

        // Safely extract count from result
        const countValue =
          countResult && countResult[0]
            ? parseInt(
                (
                  countResult[0] as { count: number | string }
                ).count?.toString() || "0"
              )
            : 0;

        return {
          results: rows || [],
          count: countValue,
        };
      }

      // Execute the search query using the User model
      logger.debug("Executing User.findAndCountAll with where clause");
      const { rows, count } = await User.findAndCountAll({
        where: whereClause,
        order,
        limit,
        offset,
      });

      logger.debug(`User search results: ${count} users found`);

      return {
        results: rows,
        count,
      };
    } catch (error) {
      logger.error("Error searching users:", error);
      throw new DatabaseError("Database error while searching users", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, query },
      });
    }
  }

  /**
   * Search books
   */
  public async searchBooks(
    query: string,
    params: SearchQueryParams
  ): Promise<{
    results: any[];
    count: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "title",
        sortOrder = "asc",
        filters = {},
      } = params;

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build search condition
      const searchCondition = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { author: { [Op.iLike]: `%${query}%` } },
          { isbn: { [Op.iLike]: `%${query}%` } },
          { genre: { [Op.iLike]: `%${query}%` } },
          { publisher: { [Op.iLike]: `%${query}%` } },
        ],
      };

      // Apply additional filters (like schoolId)
      const whereClause = {
        ...searchCondition,
        ...this.applyFilters(filters),
      };

      // Determine sort order
      const order: any =
        sortBy === "relevance"
          ? [["title", sortOrder as "asc" | "desc"]]
          : [[sortBy, sortOrder as "asc" | "desc"]];

      // Execute the search query
      const { rows, count } = await Book.findAndCountAll({
        where: whereClause,
        order,
        limit,
        offset,
        include: [
          {
            model: School,
            as: "school",
            attributes: ["id", "name"],
          },
        ],
      });

      return {
        results: rows,
        count,
      };
    } catch (error) {
      logger.error("Error searching books:", error);
      throw new DatabaseError("Database error while searching books", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, query },
      });
    }
  }

  /**
   * Search book loans
   */
  public async searchLoans(
    query: string,
    params: SearchQueryParams
  ): Promise<{
    results: any[];
    count: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        filters = {},
      } = params;

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Find books and users matching the query
      const [matchingBooks, matchingUsers] = await Promise.all([
        Book.findAll({
          where: {
            [Op.or]: [
              { title: { [Op.iLike]: `%${query}%` } },
              { author: { [Op.iLike]: `%${query}%` } },
            ],
          },
          attributes: ["id"],
        }),
        User.findAll({
          where: {
            [Op.or]: [
              { firstName: { [Op.iLike]: `%${query}%` } },
              { lastName: { [Op.iLike]: `%${query}%` } },
            ],
          },
          attributes: ["id"],
        }),
      ]);

      const bookIds = matchingBooks.map((book) => book.id);
      const userIds = matchingUsers.map((user) => user.id);

      // Build where clause
      let whereClause: any = {};

      if (bookIds.length > 0 || userIds.length > 0 || query.length === 0) {
        whereClause[Op.or] = [];

        if (bookIds.length > 0) {
          whereClause[Op.or].push({ bookId: { [Op.in]: bookIds } });
        }

        if (userIds.length > 0) {
          whereClause[Op.or].push({ userId: { [Op.in]: userIds } });
        }

        // If we're doing an empty query and have no matches but want all results
        if (
          query.length === 0 &&
          bookIds.length === 0 &&
          userIds.length === 0
        ) {
          delete whereClause[Op.or];
        }
      }

      // Apply additional filters
      const appliedFilters = this.applyFilters(filters);
      whereClause = { ...whereClause, ...appliedFilters };

      // Determine sort field and order
      const orderDirection = sortOrder.toUpperCase() as "ASC" | "DESC";
      const order: [string, "ASC" | "DESC"][] =
        sortBy === "relevance"
          ? [["createdAt", orderDirection]]
          : [[sortBy, orderDirection]];

      // Execute search
      const { rows, count } = await BookLoan.findAndCountAll({
        where: whereClause,
        order,
        limit,
        offset,
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "author", "schoolId"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      });

      return {
        results: rows,
        count,
      };
    } catch (error) {
      logger.error("Error searching loans:", error);
      throw new DatabaseError("Database error while searching loans", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, query },
      });
    }
  }

  /**
   * Search rental rules
   */
  public async searchRentalRules(
    query: string,
    params: SearchQueryParams
  ): Promise<{
    results: any[];
    count: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "name",
        sortOrder = "asc",
        filters = {},
      } = params;

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build search condition
      const searchCondition = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      };

      // Apply additional filters
      const whereClause = {
        ...searchCondition,
        ...this.applyFilters(filters),
      };

      // Determine sort order
      const orderDirection = sortOrder.toUpperCase() as "ASC" | "DESC";
      const order: [string, "ASC" | "DESC"][] =
        sortBy === "relevance"
          ? [["name", orderDirection]]
          : [[sortBy, orderDirection]];

      // Execute the search query
      const { rows, count } = await RentalRule.findAndCountAll({
        where: whereClause,
        order,
        limit,
        offset,
        include: [
          {
            model: School,
            as: "school",
            attributes: ["id", "name"],
          },
        ],
      });

      return {
        results: rows,
        count,
      };
    } catch (error) {
      logger.error("Error searching rental rules:", error);
      throw new DatabaseError("Database error while searching rental rules", {
        additionalInfo: { code: ErrorCode.DB_QUERY_FAILED, query },
      });
    }
  }

  /**
   * Search any entity by type
   */
  public async searchByEntityType(
    entityType: string,
    query: string,
    params: SearchQueryParams
  ): Promise<{
    results: any[];
    count: number;
  }> {
    switch (entityType.toLowerCase()) {
      case "school":
      case "schools":
        return this.searchSchools(query, params);
      case "address":
      case "addresses":
        return this.searchAddresses(query, params);
      case "user":
      case "users":
        return this.searchUsers(query, params);
      case "book":
      case "books":
        return this.searchBooks(query, params);
      case "loan":
      case "loans":
      case "book_loan":
      case "book_loans":
        return this.searchLoans(query, params);
      case "rental_rule":
      case "rental_rules":
      case "rentalrule":
      case "rentalrules":
        return this.searchRentalRules(query, params);
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }

  /**
   * Build search condition for schools
   */
  private buildSchoolSearchCondition(query: string): WhereOptions {
    // Implement fuzzy search with LIKE operator
    const searchTerms = query.split(/\s+/).filter((term) => term.length > 0);

    if (searchTerms.length === 0) {
      return {};
    }

    const conditions = searchTerms.map((term) => ({
      [Op.or]: [
        { name: { [Op.iLike]: `%${term}%` } },
        { shortName: { [Op.iLike]: `%${term}%` } },
        { motto: { [Op.iLike]: `%${term}%` } },
        { schoolCode: { [Op.iLike]: `%${term}%` } },
        { contactNumber: { [Op.iLike]: `%${term}%` } },
        { email: { [Op.iLike]: `%${term}%` } },
        // Convert term to number for numerical fields
        ...(isNaN(Number(term)) ? [] : [{ yearOpened: Number(term) }]),
      ],
    }));

    // All terms must match something (AND relationship between terms)
    return {
      [Op.and]: conditions,
    };
  }

  /**
   * Build search condition for addresses
   */
  private buildAddressSearchCondition(query: string): WhereOptions {
    // Implement fuzzy search with LIKE operator
    const searchTerms = query.split(/\s+/).filter((term) => term.length > 0);

    if (searchTerms.length === 0) {
      return {};
    }

    const conditions = searchTerms.map((term) => ({
      [Op.or]: [
        { buildingNumber: { [Op.iLike]: `%${term}%` } },
        { street: { [Op.iLike]: `%${term}%` } },
        { city: { [Op.iLike]: `%${term}%` } },
        { province: { [Op.iLike]: `%${term}%` } },
        { country: { [Op.iLike]: `%${term}%` } },
        { postalCode: { [Op.iLike]: `%${term}%` } },
        { addressLine2: { [Op.iLike]: `%${term}%` } },
      ],
    }));

    // All terms must match something (AND relationship between terms)
    return {
      [Op.and]: conditions,
    };
  }

  /**
   * Build search condition for users
   */
  private buildUserSearchCondition(query: string): WhereOptions {
    // Implement fuzzy search with LIKE operator
    const searchTerms = query.split(/\s+/).filter((term) => term.length > 0);

    if (searchTerms.length === 0) {
      return {};
    }

    // Use the EXACT field names that match the User model
    const conditions = searchTerms.map((term) => ({
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${term}%` } },
        { lastName: { [Op.iLike]: `%${term}%` } },
        { email: { [Op.iLike]: `%${term}%` } },
        { phoneNumber: { [Op.iLike]: `%${term}%` } }, // Use phoneNumber, not phone
        { username: { [Op.iLike]: `%${term}%` } },
        // Add more searchable fields from the User model
        { gender: { [Op.iLike]: `%${term}%` } },
        { countryCode: { [Op.iLike]: `%${term}%` } },
        // Composite search (virtual field) - we'll search for first+last name together
        Sequelize.literal(
          `CONCAT("firstName", ' ', "lastName") ILIKE '%${term.replace(
            /'/g,
            "''"
          )}%'`
        ),
      ],
    }));

    // All terms must match something (AND relationship between terms)
    return {
      [Op.and]: conditions,
    };
  }

  /**
   * Apply filters to the search query
   */
  private applyFilters(filters: Record<string, any>): WhereOptions {
    // Apply any additional filters to the query
    const whereConditions: WhereOptions = {};

    // Process filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle IN clause for arrays
          whereConditions[key] = { [Op.in]: value };
        } else if (typeof value === "object") {
          // Handle range filters like {min: 2000, max: 2020}
          const rangeConditions: any = {};
          if (value.min !== undefined) {
            rangeConditions[Op.gte] = value.min;
          }
          if (value.max !== undefined) {
            rangeConditions[Op.lte] = value.max;
          }
          whereConditions[key] = rangeConditions;
        } else {
          // Handle simple equality
          whereConditions[key] = value;
        }
      }
    });

    return whereConditions;
  }

  /**
   * Determine sort order for schools
   */
  private determineSchoolSortOrder(
    sortBy: string,
    sortOrder: "asc" | "desc"
  ): any[] {
    if (sortBy === "relevance") {
      // For relevance, we'd ideally use a calculated score
      // Since we can't easily do that with Sequelize, fall back to name
      return [["name", sortOrder]];
    }
    return [[sortBy, sortOrder]];
  }

  /**
   * Determine sort order for addresses
   */
  private determineAddressSortOrder(
    sortBy: string,
    sortOrder: "asc" | "desc"
  ): any[] {
    if (sortBy === "relevance") {
      return [["city", sortOrder]];
    }
    return [[sortBy, sortOrder]];
  }

  /**
   * Determine sort order for users
   */
  private determineUserSortOrder(
    sortBy: string,
    sortOrder: "asc" | "desc"
  ): any[] {
    if (sortBy === "relevance") {
      return [["lastName", sortOrder]];
    }
    return [[sortBy, sortOrder]];
  }
}

// Create and export repository instance
export default new SearchRepository();

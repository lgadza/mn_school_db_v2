import logger from "@/common/utils/logging/logger";
import { AppError, NotFoundError } from "@/common/utils/errors/errorUtils";
import {
  GlobalSearchDTO,
  GlobalSearchResultDTO,
  SearchResultType,
  SearchQueryParams,
  SearchResultDTO,
  SearchResultMapper,
} from "./dto";
import searchRepository from "./repository";
import { ISearchRepository, ISearchService } from "./interfaces/services";
import cache from "@/common/utils/cache/cacheUtil";

export class SearchService implements ISearchService {
  private repository: ISearchRepository;
  private readonly CACHE_PREFIX = "search:";
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(repository: ISearchRepository) {
    this.repository = repository;
  }

  /**
   * Overloaded globalSearch method implementation
   */
  public async globalSearch(
    query: string,
    schoolId?: string,
    limit?: number
  ): Promise<GlobalSearchResultDTO>;
  public async globalSearch(
    query: string,
    params: SearchQueryParams
  ): Promise<SearchResultDTO>;
  public async globalSearch(
    query: string,
    schoolIdOrParams?: string | SearchQueryParams,
    limit?: number
  ): Promise<GlobalSearchResultDTO | SearchResultDTO> {
    // Check if the second parameter is a SearchQueryParams object
    if (schoolIdOrParams && typeof schoolIdOrParams === "object") {
      // This is the new params-based signature
      // Make sure we return SearchResultDTO here
      return this.globalSearchWithParams(query, schoolIdOrParams);
    } else {
      // This is the legacy signature
      const schoolId = schoolIdOrParams as string | undefined;
      // Make sure we return GlobalSearchResultDTO here
      return this.globalSearchLegacy(query, schoolId, limit);
    }
  }

  /**
   * Legacy implementation of global search (backward compatibility)
   */
  private async globalSearchLegacy(
    query: string,
    schoolId?: string,
    limit?: number
  ): Promise<GlobalSearchResultDTO> {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}legacy:${query}:${
        schoolId || "all"
      }:${limit || "default"}`;
      const cachedResult = await cache.get(cacheKey);

      if (cachedResult) {
        return JSON.parse(cachedResult);
      }

      // Set default limit if not provided
      const resultLimit = limit || 5;

      // Convert schoolId to filters format for the repository methods
      const filters = schoolId ? { schoolId } : undefined;
      const params: SearchQueryParams = {
        limit: resultLimit,
        filters,
      };

      // Search in parallel for better performance
      const [users, schools] = await Promise.all([
        this.repository.searchUsers(query, params),
        this.repository.searchSchools(query, { limit: resultLimit }),
      ]);

      // Construct result
      const result: GlobalSearchResultDTO = {
        query,
        totalResults: users.count + schools.count,
        results: [
          ...users.results.map((user) => ({
            type: SearchResultType.USER,
            id: user.id,
            title: `${user.firstName} ${user.lastName}`,
            subtitle: user.email,
            schoolId: user.schoolId,
            schoolName: user.schoolName || user.school?.name,
            metadata: {
              role: user.role,
              status: user.status,
            },
          })),
          ...schools.results.map((school) => ({
            type: SearchResultType.SCHOOL,
            id: school.id,
            title: school.name,
            subtitle: school.district || "No district",
            metadata: {
              address: school.address,
              type: school.type,
            },
          })),
        ],
      };

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in global search:", error);
      throw new AppError("Failed to perform global search");
    }
  }

  /**
   * New implementation of global search with comprehensive parameters
   */
  private async globalSearchWithParams(
    query: string,
    params: SearchQueryParams
  ): Promise<SearchResultDTO> {
    try {
      // Start timer for performance tracking
      const startTime = Date.now();

      // Prepare query parameters
      const searchParams = {
        ...params,
        page: params.page || 1,
        limit: params.limit || 10,
      };

      // Try to get from cache first
      const cacheKey = this.buildCacheKey(query, searchParams);
      const cachedResults = await cache.get(cacheKey);

      if (cachedResults) {
        logger.debug("Retrieved search results from cache");
        return JSON.parse(cachedResults);
      }

      // Set default entity types if not specified
      const entityTypes = params.entityTypes || [
        "school",
        "address",
        "user",
        "book",
        "loan",
        "rental_rule",
      ];

      logger.info(
        `Performing global search across entities: ${entityTypes.join(
          ", "
        )} with query: "${query}"`
      );

      // Execute search on each entity type
      const searchPromises = entityTypes.map((entityType) => {
        logger.debug(`Searching entity type: ${entityType}`);
        return this.repository
          .searchByEntityType(entityType, query, {
            ...searchParams,
            // Adjust limit to get enough results for each entity type
            limit: Math.ceil((searchParams.limit * 2) / entityTypes.length),
          })
          .catch((error) => {
            logger.error(`Error searching ${entityType}:`, error);
            return { results: [], count: 0 };
          });
      });

      // Wait for all searches to complete
      const searchResults = await Promise.all(searchPromises);

      // Collect all results
      const allResults: SearchResultDTO["results"] = [];
      const resultsByType: Record<string, number> = {};

      // Log results for debugging
      entityTypes.forEach((entityType, index) => {
        const { results, count } = searchResults[index];
        resultsByType[entityType] = count;

        logger.debug(`Search results for ${entityType}: ${count} items found`);

        // Map results to standard format
        const mappedResults = results.map((result) => {
          const highlights = this.generateHighlights(result, query);

          switch (entityType) {
            case "school":
              return SearchResultMapper.mapSchoolToSearchResult(
                result,
                query,
                highlights
              );
            case "address":
              return SearchResultMapper.mapAddressToSearchResult(
                result,
                query,
                highlights
              );
            case "user":
              return SearchResultMapper.mapUserToSearchResult(
                result,
                query,
                highlights
              );
            case "book":
              return SearchResultMapper.mapBookToSearchResult(
                result,
                query,
                highlights
              );
            case "loan":
              return SearchResultMapper.mapLoanToSearchResult(
                result,
                query,
                highlights
              );
            case "rental_rule":
              return SearchResultMapper.mapRentalRuleToSearchResult(
                result,
                query,
                highlights
              );
            default:
              throw new Error(`Unsupported entity type: ${entityType}`);
          }
        });

        allResults.push(...mappedResults);
      });

      // Sort results by relevance score
      allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Apply pagination on the combined results
      const totalItems = allResults.length;
      const startIndex = (searchParams.page - 1) * searchParams.limit;
      const endIndex = startIndex + searchParams.limit;
      const paginatedResults = allResults.slice(startIndex, endIndex);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalItems / searchParams.limit);

      // Generate search suggestions (could be based on top results, common searches, etc.)
      const suggestions = this.generateSuggestions(query, allResults);

      // End timer
      const endTime = Date.now();
      const processingTimeMs = endTime - startTime;

      // Create response
      const searchResult: SearchResultDTO = {
        results: paginatedResults,
        meta: {
          query,
          page: searchParams.page,
          limit: searchParams.limit,
          totalItems,
          totalPages,
          hasNextPage: searchParams.page < totalPages,
          hasPrevPage: searchParams.page > 1,
          processingTimeMs,
          resultsByType,
        },
        suggestions,
      };

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(searchResult), this.CACHE_TTL);

      return searchResult;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error in global search service:", error);
      throw new AppError("Failed to perform search");
    }
  }

  /**
   * Get entities by type - implementation of the required interface method
   */
  public async getEntitiesByType(
    type: SearchResultType,
    query: string,
    schoolId?: string,
    limit?: number,
    page?: number
  ): Promise<GlobalSearchDTO[]> {
    try {
      // Create search params from individual parameters
      const params: SearchQueryParams = {
        limit: limit || 10,
        page: page || 1,
        filters: schoolId ? { schoolId } : undefined,
      };

      // Map SearchResultType to entity type string
      let entityType: string;
      switch (type) {
        case SearchResultType.USER:
          entityType = "user";
          break;
        case SearchResultType.SCHOOL:
          entityType = "school";
          break;
        case SearchResultType.BOOK:
          entityType = "book";
          break;
        case SearchResultType.LOAN:
          entityType = "loan";
          break;
        case SearchResultType.RENTAL_RULE:
          entityType = "rental_rule";
          break;
        default:
          throw new NotFoundError(`Search type ${type} not supported`);
      }

      // Search for the specific entity type
      const { results } = await this.repository.searchByEntityType(
        entityType,
        query,
        params
      );

      // Convert results to GlobalSearchDTO format
      return results.map((result) => {
        const baseDTO: GlobalSearchDTO = {
          type,
          id: result.id,
          title: "",
          subtitle: "",
        };

        switch (type) {
          case SearchResultType.USER:
            return {
              ...baseDTO,
              title: `${result.firstName} ${result.lastName}`,
              subtitle: result.email,
              schoolId: result.schoolId,
              schoolName: result.schoolName || result.school?.name,
              metadata: {
                role: result.role,
                status: result.status,
              },
            };
          case SearchResultType.SCHOOL:
            return {
              ...baseDTO,
              title: result.name,
              subtitle: result.district || "No district",
              metadata: {
                address: result.address,
                type: result.type,
              },
            };
          case SearchResultType.BOOK:
            return {
              ...baseDTO,
              title: result.title,
              subtitle: result.author || "Unknown author",
              schoolId: result.schoolId,
              metadata: {
                genre: result.genre,
                status: result.status,
                available: result.available,
                isbn: result.isbn,
              },
            };
          case SearchResultType.LOAN:
            return {
              ...baseDTO,
              title: result.bookTitle || "Book loan",
              subtitle: `Borrowed by: ${result.userName || "Unknown user"}`,
              schoolId: result.schoolId,
              metadata: {
                status: result.status,
                dueDate: result.dueDate,
                returnDate: result.returnDate,
              },
            };
          case SearchResultType.RENTAL_RULE:
            return {
              ...baseDTO,
              title: result.name,
              subtitle: `${result.rentalPeriodDays} days, max ${result.maxBooksPerStudent} books`,
              schoolId: result.schoolId,
              metadata: {
                renewalAllowed: result.renewalAllowed,
                lateFeePerDay: result.lateFeePerDay,
              },
            };
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Error in getEntitiesByType [${type}]:`, error);
      throw new AppError(`Failed to get entities of type ${type}`);
    }
  }

  /**
   * Search specific entity types
   */
  public async searchEntities(
    entityTypes: string[],
    query: string,
    params: SearchQueryParams
  ): Promise<SearchResultDTO> {
    // Reuse global search with specific entity types
    return this.globalSearchWithParams(query, {
      ...params,
      entityTypes,
    });
  }

  /**
   * Get search suggestions as user types
   */
  public async getSuggestions(
    query: string,
    entityTypes?: string[]
  ): Promise<{ suggestions: string[] }> {
    try {
      // If query is too short, return empty suggestions
      if (query.length < 2) {
        return { suggestions: [] };
      }

      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}suggestions:${query}:${
        entityTypes?.join(",") || "all"
      }`;
      const cachedSuggestions = await cache.get(cacheKey);

      if (cachedSuggestions) {
        return JSON.parse(cachedSuggestions);
      }

      // Simple implementation - just get top results and use their titles
      const searchResult = await this.globalSearchWithParams(query, {
        limit: 5,
        entityTypes,
      });

      // Extract unique titles from results
      const suggestions = Array.from(
        new Set(
          searchResult.results.map((result) => result.title).filter(Boolean)
        )
      ).slice(0, 10);

      // Add query terms if relevant
      const terms = query.split(/\s+/).filter((term) => term.length > 3);
      terms.forEach((term) => {
        if (
          !suggestions.some((s) => s.toLowerCase().includes(term.toLowerCase()))
        ) {
          suggestions.push(term);
        }
      });

      const result = { suggestions };

      // Store in cache
      await cache.set(cacheKey, JSON.stringify(result), 300); // 5 minutes

      return result;
    } catch (error) {
      logger.error("Error getting search suggestions:", error);
      return { suggestions: [] };
    }
  }

  /**
   * Index or reindex an entity for improved search
   */
  public async indexEntity(
    entityType: string,
    entityId: string
  ): Promise<boolean> {
    try {
      // In a real implementation, this would update an Elasticsearch index or similar
      // For now, just invalidate any cached search results
      await this.invalidateSearchCache();
      return true;
    } catch (error) {
      logger.error("Error indexing entity:", error);
      return false;
    }
  }

  /**
   * Rebuild all search indexes
   */
  public async rebuildIndexes(): Promise<boolean> {
    try {
      // In a real implementation, this would rebuild all Elasticsearch indexes
      // For now, just invalidate all cached search results
      await this.invalidateSearchCache();
      return true;
    } catch (error) {
      logger.error("Error rebuilding search indexes:", error);
      return false;
    }
  }

  /**
   * Generate highlights for search results
   */
  private generateHighlights(entity: any, query: string): string[] {
    const highlights: string[] = [];
    const searchTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2);

    if (searchTerms.length === 0) {
      return highlights;
    }

    // Find matches in entity fields
    Object.entries(entity).forEach(([key, value]) => {
      if (typeof value === "string") {
        const lowerValue = value.toLowerCase();

        searchTerms.forEach((term) => {
          if (lowerValue.includes(term)) {
            // Create a highlight snippet with context
            const index = lowerValue.indexOf(term);
            const start = Math.max(0, index - 20);
            const end = Math.min(lowerValue.length, index + term.length + 20);
            let snippet = value.substring(start, end);

            // Add ellipsis for truncated content
            if (start > 0) snippet = `...${snippet}`;
            if (end < value.length) snippet = `${snippet}...`;

            // Bold the matching term
            const boldSnippet = snippet.replace(
              new RegExp(term, "gi"),
              (match) => `<b>${match}</b>`
            );

            highlights.push(boldSnippet);
          }
        });
      }
    });

    return highlights;
  }

  /**
   * Generate search suggestions
   */
  private generateSuggestions(query: string, results: any[]): string[] {
    const suggestions: string[] = [];

    // Generate suggestions from entity titles
    results.slice(0, 3).forEach((result) => {
      if (result.title && !suggestions.includes(result.title)) {
        suggestions.push(result.title);
      }
    });

    // Add query terms if they're substantial
    const terms = query.split(/\s+/).filter((term) => term.length > 3);
    terms.forEach((term) => {
      // Suggest a capitalized version
      const capitalized = term.charAt(0).toUpperCase() + term.slice(1);
      if (!suggestions.includes(capitalized)) {
        suggestions.push(capitalized);
      }
    });

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Build cache key for search results
   */
  private buildCacheKey(query: string, params: any): string {
    const paramsStr = JSON.stringify({
      page: params.page,
      limit: params.limit,
      entityTypes: params.entityTypes,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });

    return `${this.CACHE_PREFIX}${query}:${paramsStr}`;
  }

  /**
   * Invalidate search cache
   */
  private async invalidateSearchCache(): Promise<void> {
    // Since our cache utility doesn't support pattern matching for keys,
    // we'll set a flag in the cache to indicate that results are stale
    // This is a simplified approach - a production system would need a more robust solution
    try {
      await cache.set(
        `${this.CACHE_PREFIX}invalidated`,
        Date.now().toString(),
        86400
      ); // 24 hours
      logger.info("Search cache invalidation flag set");
    } catch (error) {
      logger.error("Error invalidating search cache:", error);
    }
  }
}

// Create and export service instance
export default new SearchService(searchRepository);

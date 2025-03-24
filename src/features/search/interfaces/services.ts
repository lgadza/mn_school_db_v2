import {
  SearchResultDTO,
  SearchQueryParams,
  GlobalSearchDTO,
  GlobalSearchResultDTO,
  SearchResultType,
} from "../dto";

/**
 * Interface for the search repository
 */
export interface ISearchRepository {
  /**
   * Search schools
   */
  searchSchools(
    query: string,
    params: SearchQueryParams
  ): Promise<{
    results: any[];
    count: number;
  }>;

  /**
   * Search addresses
   */
  searchAddresses(
    query: string,
    params: SearchQueryParams
  ): Promise<{
    results: any[];
    count: number;
  }>;

  /**
   * Search users
   */
  searchUsers(
    query: string,
    params: SearchQueryParams
  ): Promise<{
    results: any[];
    count: number;
  }>;

  /**
   * Search any entity by type
   */
  searchByEntityType(
    entityType: string,
    query: string,
    params: SearchQueryParams
  ): Promise<{
    results: any[];
    count: number;
  }>;
}

/**
 * Interface for the search service
 */
export interface ISearchService {
  /**
   * Get entities by type
   */
  getEntitiesByType(
    type: SearchResultType,
    query: string,
    schoolId?: string,
    limit?: number,
    page?: number
  ): Promise<GlobalSearchDTO[]>;

  /**
   * Perform a global search across multiple entities (legacy version)
   * @deprecated Use the params-based overload instead
   */
  globalSearch(
    query: string,
    schoolId?: string,
    limit?: number
  ): Promise<GlobalSearchResultDTO>;

  /**
   * Perform a global search across all entities
   */
  globalSearch(
    query: string,
    params: SearchQueryParams
  ): Promise<SearchResultDTO>;

  /**
   * Search specific entity types
   */
  searchEntities(
    entityTypes: string[],
    query: string,
    params: SearchQueryParams
  ): Promise<SearchResultDTO>;

  /**
   * Get search suggestions as user types
   */
  getSuggestions(
    query: string,
    entityTypes?: string[]
  ): Promise<{ suggestions: string[] }>;

  /**
   * Index or reindex an entity for improved search
   */
  indexEntity(entityType: string, entityId: string): Promise<boolean>;

  /**
   * Rebuild all search indexes
   */
  rebuildIndexes(): Promise<boolean>;
}

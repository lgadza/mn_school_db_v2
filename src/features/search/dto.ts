/**
 * Search query parameters
 */
export interface SearchQueryParams {
  page?: number;
  limit?: number;
  entityTypes?: string[];
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fuzzy?: boolean;
}

/**
 * Individual search result item
 */
export interface SearchResultItem {
  id: string;
  entityType: string;
  title: string;
  subtitle?: string;
  description?: string;
  highlights?: {
    field: string;
    snippets: string[];
  }[];
  relevanceScore: number;
  thumbnailUrl?: string;
  url?: string;
  metadata?: Record<string, any>;
}

/**
 * Search result DTO with pagination
 */
export interface SearchResultDTO {
  results: SearchResultItem[];
  meta: {
    query: string;
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    processingTimeMs: number;
    resultsByType: {
      [entityType: string]: number;
    };
  };
  suggestions?: string[];
}

/**
 * Search history item
 */
export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  timestamp: Date;
  resultCount: number;
}

/**
 * Mapper to convert raw search results to DTOs
 */
export class SearchResultMapper {
  /**
   * Map a school entity to a search result item
   */
  public static mapSchoolToSearchResult(
    school: any,
    query: string,
    highlights: string[] = []
  ): SearchResultItem {
    return {
      id: school.id,
      entityType: "school",
      title: school.name,
      subtitle: `${school.shortName} - ${school.level} school`,
      description:
        school.motto ||
        `${school.isPublic ? "Public" : "Private"} school established in ${
          school.yearOpened
        }`,
      relevanceScore: this.calculateRelevanceScore(school, query),
      thumbnailUrl: school.logoUrl,
      url: `/schools/${school.id}`,
      metadata: {
        level: school.level,
        schoolCode: school.schoolCode,
        schoolType: school.schoolType,
        yearOpened: school.yearOpened,
        isPublic: school.isPublic,
      },
      highlights:
        highlights.length > 0
          ? [
              {
                field: "all",
                snippets: highlights,
              },
            ]
          : undefined,
    };
  }

  /**
   * Map an address entity to a search result item
   */
  public static mapAddressToSearchResult(
    address: any,
    query: string,
    highlights: string[] = []
  ): SearchResultItem {
    const title = `${address.buildingNumber} ${address.street}`;
    const subtitle = `${address.city}, ${address.province}`;

    return {
      id: address.id,
      entityType: "address",
      title,
      subtitle,
      description:
        address.formattedAddress || `${title}, ${subtitle}, ${address.country}`,
      relevanceScore: this.calculateRelevanceScore(address, query),
      url: `/addresses/${address.id}`,
      metadata: {
        city: address.city,
        province: address.province,
        country: address.country,
        postalCode: address.postalCode,
      },
      highlights:
        highlights.length > 0
          ? [
              {
                field: "all",
                snippets: highlights,
              },
            ]
          : undefined,
    };
  }

  /**
   * Map a user entity to a search result item
   */
  public static mapUserToSearchResult(
    user: any,
    query: string,
    highlights: string[] = []
  ): SearchResultItem {
    return {
      id: user.id,
      entityType: "user",
      title: `${user.firstName} ${user.lastName}`,
      subtitle: user.role || user.email,
      description:
        user.bio ||
        `Phone: ${user.phoneNumber || "N/A"}${
          user.countryCode ? ` (${user.countryCode})` : ""
        }` + ` | Created: ${new Date(user.createdAt).toLocaleDateString()}`,
      relevanceScore: this.calculateRelevanceScore(user, query),
      thumbnailUrl: user.avatar,
      url: `/users/${user.id}`,
      metadata: {
        email: user.email,
        role: user.role,
        username: user.username,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        gender: user.gender,
        countryCode: user.countryCode,
      },
      highlights:
        highlights.length > 0
          ? [{ field: "all", snippets: highlights }]
          : undefined,
    };
  }

  /**
   * Calculate relevance score based on match quality
   * This can be enhanced with more sophisticated algorithms
   */
  private static calculateRelevanceScore(entity: any, query: string): number {
    // Simple scoring algorithm - can be enhanced
    let score = 0;
    const lowercaseQuery = query.toLowerCase();

    // Check all string fields for exact matches
    Object.keys(entity).forEach((key) => {
      const value = entity[key];
      if (typeof value === "string") {
        const lowercaseValue = value.toLowerCase();

        // Exact match
        if (lowercaseValue === lowercaseQuery) {
          score += 10;
        }
        // Contains as whole word
        else if (lowercaseValue.includes(` ${lowercaseQuery} `)) {
          score += 5;
        }
        // Contains as substring
        else if (lowercaseValue.includes(lowercaseQuery)) {
          score += 3;
        }
        // Starts with the query
        else if (lowercaseValue.startsWith(lowercaseQuery)) {
          score += 4;
        }
      }
    });

    return score;
  }
}

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
   * Map a book entity to a search result item
   */
  public static mapBookToSearchResult(
    book: any,
    query: string,
    highlights: string[] = []
  ): SearchResultItem {
    return {
      id: book.id,
      entityType: "book",
      title: book.title,
      subtitle: book.author ? `by ${book.author}` : book.genre,
      description: book.description || `ISBN: ${book.isbn || "N/A"}`,
      relevanceScore: this.calculateRelevanceScore(book, query),
      thumbnailUrl: book.coverUrl,
      url: `/books/${book.id}`,
      metadata: {
        genre: book.genre,
        isbn: book.isbn,
        publishYear: book.publishYear,
        available: book.available,
        status: book.status,
        schoolId: book.schoolId,
        schoolName: book.schoolName || book.school?.name,
      },
      highlights:
        highlights.length > 0
          ? [{ field: "all", snippets: highlights }]
          : undefined,
    };
  }

  /**
   * Map a loan entity to a search result item
   */
  public static mapLoanToSearchResult(
    loan: any,
    query: string,
    highlights: string[] = []
  ): SearchResultItem {
    const dueDate = loan.dueDate
      ? new Date(loan.dueDate).toLocaleDateString()
      : "N/A";
    const returnDate = loan.returnDate
      ? new Date(loan.returnDate).toLocaleDateString()
      : "Not returned";

    return {
      id: loan.id,
      entityType: "loan",
      title: loan.bookTitle || "Book Loan",
      subtitle: `Borrowed by: ${loan.userName || "Unknown"}`,
      description: `Status: ${loan.status} | Due: ${dueDate} | Returned: ${returnDate}`,
      relevanceScore: this.calculateRelevanceScore(loan, query),
      url: `/loans/${loan.id}`,
      metadata: {
        bookId: loan.bookId,
        userId: loan.userId,
        status: loan.status,
        dueDate: loan.dueDate,
        returnDate: loan.returnDate,
        schoolId: loan.schoolId,
      },
      highlights:
        highlights.length > 0
          ? [{ field: "all", snippets: highlights }]
          : undefined,
    };
  }

  /**
   * Map a rental rule entity to a search result item
   */
  public static mapRentalRuleToSearchResult(
    rule: any,
    query: string,
    highlights: string[] = []
  ): SearchResultItem {
    return {
      id: rule.id,
      entityType: "rental_rule",
      title: rule.name,
      subtitle: `${rule.rentalPeriodDays} days, max ${rule.maxBooksPerStudent} books`,
      description:
        rule.description ||
        `Renewal ${rule.renewalAllowed ? "allowed" : "not allowed"}. ${
          rule.lateFeePerDay
            ? `Late fee: $${rule.lateFeePerDay}/day`
            : "No late fee"
        }`,
      relevanceScore: this.calculateRelevanceScore(rule, query),
      url: `/rental-rules/${rule.id}`,
      metadata: {
        rentalPeriodDays: rule.rentalPeriodDays,
        maxBooksPerStudent: rule.maxBooksPerStudent,
        renewalAllowed: rule.renewalAllowed,
        lateFeePerDay: rule.lateFeePerDay,
        schoolId: rule.schoolId,
        schoolName: rule.schoolName || rule.school?.name,
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

/**
 * Search result types
 */
export enum SearchResultType {
  USER = "user",
  SCHOOL = "school",
  BOOK = "book",
  LOAN = "loan",
  RENTAL_RULE = "rental_rule",
}

/**
 * Global search DTO
 */
export interface GlobalSearchDTO {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  schoolId?: string;
  schoolName?: string;
  metadata?: Record<string, any>;
}

/**
 * Global search result DTO
 */
export interface GlobalSearchResultDTO {
  query: string;
  totalResults: number;
  results: GlobalSearchDTO[];
}

/**
 * Search result DTO for books
 */
export interface BookSearchResultDTO extends GlobalSearchDTO {
  type: SearchResultType.BOOK;
  metadata: {
    genre: string;
    status: string;
    available: boolean;
    isbn: string | null;
  };
}

/**
 * Search result DTO for loans
 */
export interface LoanSearchResultDTO extends GlobalSearchDTO {
  type: SearchResultType.LOAN;
  metadata: {
    status: string;
    dueDate: string | null;
    returnDate: string | null;
  };
}

/**
 * Search result DTO for rental rules
 */
export interface RentalRuleSearchResultDTO extends GlobalSearchDTO {
  type: SearchResultType.RENTAL_RULE;
  metadata: {
    renewalAllowed: boolean;
    lateFeePerDay: number | null;
  };
}

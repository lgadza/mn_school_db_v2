/**
 * Category interface
 * Defines the core structure of a category
 */
export interface CategoryInterface {
  id: string;
  name: string;
  code: string | null;
  schoolId: string;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  // Related entities from associations
  school?: any;
}

/**
 * Category statistics interface
 */
export interface CategoryStatistics {
  totalCategories: number;
  categoriesPerSchool: { [schoolId: string]: number };
  categoriesByCode: { [code: string]: number };
}

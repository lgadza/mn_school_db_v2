import Category from "./model";
import categoryService from "./service";
import categoryController from "./controller";
import categoryRepository from "./repository";
import categoryValidationSchemas from "./validation";
import categoryRoutes from "./routes";
import { CategoryInterface, CategoryStatistics } from "./interfaces/interfaces";
import {
  CategoryBaseDTO,
  CategoryDetailDTO,
  CategorySimpleDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryListQueryParams,
  PaginatedCategoryListDTO,
  CategoryDTOMapper,
  CategoryStatisticsDTO,
} from "./dto";
import { ICategoryRepository, ICategoryService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Category,
  categoryService,
  categoryController,
  categoryRepository,
  categoryValidationSchemas,
  categoryRoutes,
  CategoryInterface,
  CategoryStatistics,
  CategoryBaseDTO,
  CategoryDetailDTO,
  CategorySimpleDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryListQueryParams,
  PaginatedCategoryListDTO,
  CategoryStatisticsDTO,
  CategoryDTOMapper,
  ICategoryRepository,
  ICategoryService,
};

export default Category;

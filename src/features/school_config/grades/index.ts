import Grade from "./model";
import gradeService from "./service";
import gradeController from "./controller";
import gradeRepository from "./repository";
import gradeValidationSchemas from "./validation";
import gradeRoutes from "./routes";
import { GradeInterface, GradeStatistics } from "./interfaces/interfaces";
import {
  GradeBaseDTO,
  GradeDetailDTO,
  GradeSimpleDTO,
  CreateGradeDTO,
  UpdateGradeDTO,
  GradeListQueryParams,
  PaginatedGradeListDTO,
  GradeDTOMapper,
  GradeStatisticsDTO,
} from "./dto";
import { IGradeRepository, IGradeService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Grade,
  gradeService,
  gradeController,
  gradeRepository,
  gradeValidationSchemas,
  gradeRoutes,
  GradeInterface,
  GradeStatistics,
  GradeBaseDTO,
  GradeDetailDTO,
  GradeSimpleDTO,
  CreateGradeDTO,
  UpdateGradeDTO,
  GradeListQueryParams,
  PaginatedGradeListDTO,
  GradeStatisticsDTO,
  GradeDTOMapper,
  IGradeRepository,
  IGradeService,
};

export default Grade;

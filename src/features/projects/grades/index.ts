import ProjectGrade from "./model";
import gradeService from "./service";
import gradeController from "./controller";
import gradeRepository from "./repository";
import gradeValidationSchemas from "./validation";
import gradeRoutes from "./routes";
import {
  ProjectGradeInterface,
  ProjectGradeDeletionResult,
} from "./interfaces/interfaces";
import {
  GradeBaseDTO,
  GradeDetailDTO,
  GradeSimpleDTO,
  CreateGradeDTO,
  UpdateGradeDTO,
  GradeListQueryParams,
  GradeDTOMapper,
} from "./dto";
import {
  IProjectGradeRepository,
  IProjectGradeService,
} from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  ProjectGrade,
  gradeService,
  gradeController,
  gradeRepository,
  gradeValidationSchemas,
  gradeRoutes,
  ProjectGradeInterface,
  ProjectGradeDeletionResult,
  GradeBaseDTO,
  GradeDetailDTO,
  GradeSimpleDTO,
  CreateGradeDTO,
  UpdateGradeDTO,
  GradeListQueryParams,
  GradeDTOMapper,
  IProjectGradeRepository,
  IProjectGradeService,
};

export default ProjectGrade;

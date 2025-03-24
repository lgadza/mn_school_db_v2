import Subject from "./model";
import subjectService from "./service";
import subjectController from "./controller";
import subjectRepository from "./repository";
import subjectValidationSchemas from "./validation";
import subjectRoutes from "./routes";
import { SubjectInterface, SubjectStatistics } from "./interfaces/interfaces";
import {
  SubjectBaseDTO,
  SubjectDetailDTO,
  SubjectSimpleDTO,
  CreateSubjectDTO,
  UpdateSubjectDTO,
  SubjectListQueryParams,
  PaginatedSubjectListDTO,
  SubjectDTOMapper,
  SubjectStatisticsDTO,
} from "./dto";
import { ISubjectRepository, ISubjectService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Subject,
  subjectService,
  subjectController,
  subjectRepository,
  subjectValidationSchemas,
  subjectRoutes,
  SubjectInterface,
  SubjectStatistics,
  SubjectBaseDTO,
  SubjectDetailDTO,
  SubjectSimpleDTO,
  CreateSubjectDTO,
  UpdateSubjectDTO,
  SubjectListQueryParams,
  PaginatedSubjectListDTO,
  SubjectStatisticsDTO,
  SubjectDTOMapper,
  ISubjectRepository,
  ISubjectService,
};

export default Subject;

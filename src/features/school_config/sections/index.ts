import Section from "./model";
import sectionService from "./service";
import sectionController from "./controller";
import sectionRepository from "./repository";
import sectionValidationSchemas from "./validation";
import sectionRoutes from "./routes";
import { SectionInterface, SectionStatistics } from "./interfaces/interfaces";
import {
  SectionBaseDTO,
  SectionDetailDTO,
  SectionSimpleDTO,
  CreateSectionDTO,
  UpdateSectionDTO,
  SectionListQueryParams,
  PaginatedSectionListDTO,
  SectionDTOMapper,
  SectionStatisticsDTO,
} from "./dto";
import { ISectionRepository, ISectionService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Section,
  sectionService,
  sectionController,
  sectionRepository,
  sectionValidationSchemas,
  sectionRoutes,
  SectionInterface,
  SectionStatistics,
  SectionBaseDTO,
  SectionDetailDTO,
  SectionSimpleDTO,
  CreateSectionDTO,
  UpdateSectionDTO,
  SectionListQueryParams,
  PaginatedSectionListDTO,
  SectionStatisticsDTO,
  SectionDTOMapper,
  ISectionRepository,
  ISectionService,
};

export default Section;

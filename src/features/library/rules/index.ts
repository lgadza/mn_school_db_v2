import RentalRule from "./model";
import rentalRuleService from "./service";
import rentalRuleController from "./controller";
import rentalRuleRepository from "./repository";
import rentalRuleValidationSchemas from "./validation";
import rentalRuleRoutes from "./routes";
import { RentalRuleInterface } from "./model";
import {
  RentalRuleBaseDTO,
  RentalRuleDetailDTO,
  CreateRentalRuleDTO,
  UpdateRentalRuleDTO,
  RentalRuleListQueryParams,
  PaginatedRentalRuleListDTO,
  RentalRuleDTOMapper,
} from "./dto";

// Import and initialize associations
import defineAssociations from "../model-associations";
defineAssociations();

export {
  RentalRule,
  rentalRuleService,
  rentalRuleController,
  rentalRuleRepository,
  rentalRuleValidationSchemas,
  rentalRuleRoutes,
  RentalRuleInterface,
  RentalRuleBaseDTO,
  RentalRuleDetailDTO,
  CreateRentalRuleDTO,
  UpdateRentalRuleDTO,
  RentalRuleListQueryParams,
  PaginatedRentalRuleListDTO,
  RentalRuleDTOMapper,
};

export default RentalRule;

import ProjectFeedback from "./model";
import feedbackService from "./service";
import feedbackController from "./controller";
import feedbackRepository from "./repository";
import feedbackValidationSchemas from "./validation";
import feedbackRoutes from "./routes";
import {
  ProjectFeedbackInterface,
  ProjectFeedbackDeletionResult,
  FeedbackType,
} from "./interfaces/interfaces";
import {
  FeedbackBaseDTO,
  FeedbackDetailDTO,
  FeedbackSimpleDTO,
  CreateFeedbackDTO,
  UpdateFeedbackDTO,
  FeedbackListQueryParams,
  FeedbackDTOMapper,
} from "./dto";
import {
  IProjectFeedbackRepository,
  IProjectFeedbackService,
} from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  ProjectFeedback,
  feedbackService,
  feedbackController,
  feedbackRepository,
  feedbackValidationSchemas,
  feedbackRoutes,
  ProjectFeedbackInterface,
  ProjectFeedbackDeletionResult,
  FeedbackType,
  FeedbackBaseDTO,
  FeedbackDetailDTO,
  FeedbackSimpleDTO,
  CreateFeedbackDTO,
  UpdateFeedbackDTO,
  FeedbackListQueryParams,
  FeedbackDTOMapper,
  IProjectFeedbackRepository,
  IProjectFeedbackService,
};

export default ProjectFeedback;

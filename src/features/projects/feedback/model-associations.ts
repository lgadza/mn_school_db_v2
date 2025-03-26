import ProjectFeedback from "./model";
import Project from "../project/model";
import User from "../../users/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the ProjectFeedback model
const MODULE_NAME = "projects/feedback";

// ProjectFeedback belongs to Project
associationRegistry.registerBelongsTo(
  ProjectFeedback,
  Project,
  {
    foreignKey: "projectId",
    as: "project",
    onDelete: "CASCADE",
  },
  MODULE_NAME
);

// ProjectFeedback belongs to User (author)
associationRegistry.registerBelongsTo(
  ProjectFeedback,
  User,
  {
    foreignKey: "authorId",
    as: "author",
  },
  MODULE_NAME
);

// ProjectFeedback belongs to parent ProjectFeedback (for replies)
associationRegistry.registerBelongsTo(
  ProjectFeedback,
  ProjectFeedback,
  {
    foreignKey: "parentId",
    as: "parent",
  },
  MODULE_NAME
);

// ProjectFeedback has many reply ProjectFeedbacks
associationRegistry.registerHasMany(
  ProjectFeedback,
  ProjectFeedback,
  {
    foreignKey: "parentId",
    as: "replies",
  },
  MODULE_NAME
);

// Register has-many relationship in the Project model-associations file
associationRegistry.registerHasMany(
  Project,
  ProjectFeedback,
  {
    foreignKey: "projectId",
    as: "feedback",
  },
  MODULE_NAME
);

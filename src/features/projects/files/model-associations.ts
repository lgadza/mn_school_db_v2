import ProjectFile from "./model";
import Project from "../project/model";
import User from "../../users/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the ProjectFile model
const MODULE_NAME = "projects/files";

// ProjectFile belongs to Project
associationRegistry.registerBelongsTo(
  ProjectFile,
  Project,
  {
    foreignKey: "projectId",
    as: "project",
    onDelete: "CASCADE",
  },
  MODULE_NAME
);

// ProjectFile belongs to User (uploader)
associationRegistry.registerBelongsTo(
  ProjectFile,
  User,
  {
    foreignKey: "uploadedById",
    as: "uploadedBy",
  },
  MODULE_NAME
);

// Register has-many relationship in the Project model-associations file
associationRegistry.registerHasMany(
  Project,
  ProjectFile,
  {
    foreignKey: "projectId",
    as: "files",
  },
  MODULE_NAME
);

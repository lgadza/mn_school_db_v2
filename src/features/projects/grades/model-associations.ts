import ProjectGrade from "./model";
import Project from "../project/model";
import User from "../../users/model";
import Student from "../../accounts/students/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the ProjectGrade model
const MODULE_NAME = "projects/grades";

// ProjectGrade belongs to Project
associationRegistry.registerBelongsTo(
  ProjectGrade,
  Project,
  {
    foreignKey: "projectId",
    as: "project",
    onDelete: "CASCADE",
  },
  MODULE_NAME
);

// ProjectGrade belongs to Student
associationRegistry.registerBelongsTo(
  ProjectGrade,
  Student,
  {
    foreignKey: "studentId",
    as: "student",
  },
  MODULE_NAME
);

// ProjectGrade belongs to User (grader)
associationRegistry.registerBelongsTo(
  ProjectGrade,
  User,
  {
    foreignKey: "graderId",
    as: "grader",
  },
  MODULE_NAME
);

// Register has-many relationship in the Project model-associations file
associationRegistry.registerHasMany(
  Project,
  ProjectGrade,
  {
    foreignKey: "projectId",
    as: "grades",
  },
  MODULE_NAME
);

import Project from "./model";
import School from "../../schools/model";
import Subject from "../../school_config/subjects/model";
import Class from "../../school_config/classes/model";
import Teacher from "../../teachers/model";
import User from "../../users/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Project model
const MODULE_NAME = "projects/project";

// Project belongs to School
associationRegistry.registerBelongsTo(
  Project,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Project belongs to Subject
associationRegistry.registerBelongsTo(
  Project,
  Subject,
  {
    foreignKey: "subjectId",
    as: "subject",
  },
  MODULE_NAME
);

// Project belongs to Class (optional)
associationRegistry.registerBelongsTo(
  Project,
  Class,
  {
    foreignKey: "classId",
    as: "class",
  },
  MODULE_NAME
);

// Project belongs to Teacher
associationRegistry.registerBelongsTo(
  Project,
  Teacher,
  {
    foreignKey: "teacherId",
    as: "teacher",
  },
  MODULE_NAME
);

// Project belongs to User (creator)
associationRegistry.registerBelongsTo(
  Project,
  User,
  {
    foreignKey: "createdById",
    as: "createdBy",
  },
  MODULE_NAME
);

// Project belongs to User (modifier)
associationRegistry.registerBelongsTo(
  Project,
  User,
  {
    foreignKey: "modifiedById",
    as: "modifiedBy",
  },
  MODULE_NAME
);

// Note: The has-many relationships (files, grades, feedback) will be set up
// in their respective module-associations.ts files

import Department from "./model";
import School from "../../schools/model";
import Subject from "../subjects/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Department model
// The module name helps with debugging and dependency tracking
const MODULE_NAME = "school_config/departments";

// Department belongs to School
associationRegistry.registerBelongsTo(
  Department,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Department has many Subjects
associationRegistry.registerHasMany(
  Department,
  Subject,
  {
    foreignKey: "departmentId",
    as: "subjects",
  },
  MODULE_NAME
);

// Note: The inverse relationship (School.hasMany(Department))
// should be defined in the school model-associations.ts file
// to maintain clear ownership

import Subject from "./model";
import School from "../../schools/model";
import Department from "../departments/model";
import Category from "../categories/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Subject model
// The module name helps with debugging and dependency tracking
const MODULE_NAME = "school_config/subjects";

// Subject belongs to School
associationRegistry.registerBelongsTo(
  Subject,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Subject belongs to Category (optional)
associationRegistry.registerBelongsTo(
  Subject,
  Category,
  {
    foreignKey: "categoryId",
    as: "category",
  },
  MODULE_NAME
);

// Subject belongs to Department (optional)
associationRegistry.registerBelongsTo(
  Subject,
  Department,
  {
    foreignKey: "departmentId",
    as: "department",
  },
  MODULE_NAME
);

// Subject belongs to Subject (prerequisite - self-reference)
associationRegistry.registerBelongsTo(
  Subject,
  Subject,
  {
    foreignKey: "prerequisite",
    as: "prerequisiteSubject",
  },
  MODULE_NAME
);

// The inverse relationship (School.hasMany(Subject), etc.)
// should be defined in the respective model-associations.ts files
// to maintain clear ownership

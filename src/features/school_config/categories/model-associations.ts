import Category from "./model";
import School from "../../schools/model";
import Subject from "../subjects/model";
import associationRegistry, {
  AssociationType,
} from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Category model
// The module name helps with debugging and dependency tracking
const MODULE_NAME = "school_config/categories";

// Category belongs to School
associationRegistry.registerBelongsTo(
  Category,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Category has many Subjects
associationRegistry.registerHasMany(
  Category,
  Subject,
  {
    foreignKey: "categoryId",
    as: "subjects",
  },
  MODULE_NAME
);

// Note: The inverse relationship (School.hasMany(Category))
// should be defined in the school model-associations.ts file
// to maintain clear ownership

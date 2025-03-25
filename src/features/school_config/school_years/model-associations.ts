import SchoolYear from "./model";
import School from "../../schools/model";
import associationRegistry, {
  AssociationType,
} from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the SchoolYear model
// The module name helps with debugging and dependency tracking
const MODULE_NAME = "school_config/school_years";

// SchoolYear belongs to School
associationRegistry.registerBelongsTo(
  SchoolYear,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Note: The inverse relationship (School.hasMany(SchoolYear))
// should be defined in the school model-associations.ts file
// to maintain clear ownership

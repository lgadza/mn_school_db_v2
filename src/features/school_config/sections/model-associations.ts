import Section from "./model";
import School from "../../schools/model";
import associationRegistry, {
  AssociationType,
} from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Section model
// The module name helps with debugging and dependency tracking
const MODULE_NAME = "school_config/sections";

// Section belongs to School
associationRegistry.registerBelongsTo(
  Section,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Note: The inverse relationship (School.hasMany(Section))
// should be defined in the school model-associations.ts file
// to maintain clear ownership

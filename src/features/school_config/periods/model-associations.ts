import Period from "./model";
import School from "../../schools/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Period model
const MODULE_NAME = "school_config/periods";

// Period belongs to School
associationRegistry.registerBelongsTo(
  Period,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Note: The inverse relationship (School.hasMany(Period))
// should be defined in the school model-associations.ts file
// to maintain clear ownership

import SchoolApplication from "./model";
import Prospect from "../prospects/model";
import School from "../../schools/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the SchoolApplication model
const MODULE_NAME = "school-applications";

// SchoolApplication belongs to Prospect
associationRegistry.registerBelongsTo(
  SchoolApplication,
  Prospect,
  {
    foreignKey: "prospectId",
    as: "prospect",
  },
  MODULE_NAME
);

// SchoolApplication belongs to School
associationRegistry.registerBelongsTo(
  SchoolApplication,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Prospect has many SchoolApplications
associationRegistry.registerHasMany(
  Prospect,
  SchoolApplication,
  {
    foreignKey: "prospectId",
    as: "applications",
  },
  MODULE_NAME
);

// School has many SchoolApplications
associationRegistry.registerHasMany(
  School,
  SchoolApplication,
  {
    foreignKey: "schoolId",
    as: "applications",
  },
  MODULE_NAME
);

export default () => {
  // This function will be called when loading all associations
  // It doesn't need to do anything as the associations are registered above
};

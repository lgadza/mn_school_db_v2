import SchoolFee from "./model";
import School from "../../schools/model";
import associationRegistry from "@/common/utils/db/AssociationRegistry";

// Register all associations for the SchoolFee model
const MODULE_NAME = "school_fees";

// SchoolFee belongs to School
associationRegistry.registerBelongsTo(
  SchoolFee,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Additional associations can be added here as needed

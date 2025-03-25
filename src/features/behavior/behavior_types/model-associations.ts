import BehaviorType from "./model";
import School from "../../schools/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the BehaviorType model
const MODULE_NAME = "behavior/behavior_types";

// BehaviorType belongs to School
associationRegistry.registerBelongsTo(
  BehaviorType,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

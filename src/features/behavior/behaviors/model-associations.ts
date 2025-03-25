import Behavior from "./model";
import School from "../../schools/model";
import BehaviorType from "../../behavior/behavior_types/model";
import Class from "../../school_config/classes/model";
import User from "../../users/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Behavior model
const MODULE_NAME = "behavior/behaviors";

// Behavior belongs to School
associationRegistry.registerBelongsTo(
  Behavior,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Behavior belongs to BehaviorType
associationRegistry.registerBelongsTo(
  Behavior,
  BehaviorType,
  {
    foreignKey: "behaviorTypeId",
    as: "behaviorType",
  },
  MODULE_NAME
);

// Behavior belongs to Class
associationRegistry.registerBelongsTo(
  Behavior,
  Class,
  {
    foreignKey: "classId",
    as: "class",
  },
  MODULE_NAME
);

// Behavior belongs to Staff (User)
associationRegistry.registerBelongsTo(
  Behavior,
  User,
  {
    foreignKey: "staffId",
    as: "staff",
  },
  MODULE_NAME
);

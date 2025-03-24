import Block from "./model";
import School from "../../schools/model";
import Classroom from "../classrooms/model";
import associationRegistry, {
  AssociationType,
} from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Block model
// The module name helps with debugging and dependency tracking
const MODULE_NAME = "school_config/blocks";

// Block belongs to School
associationRegistry.registerBelongsTo(
  Block,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Block has many Classrooms
associationRegistry.registerHasMany(
  Block,
  Classroom,
  {
    foreignKey: "blockId",
    as: "classrooms",
    onDelete: "CASCADE",
  },
  MODULE_NAME
);

// Note: The inverse relationship (School.hasMany(Block))
// should be defined in the school model-associations.ts file
// to maintain clear ownership

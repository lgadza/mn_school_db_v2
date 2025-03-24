import Classroom from "./model";
import School from "../../schools/model";
import Block from "../blocks/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Classroom model
// The module name helps with debugging and dependency tracking
const MODULE_NAME = "school_config/classrooms";

// Classroom belongs to School
associationRegistry.registerBelongsTo(
  Classroom,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Classroom belongs to Block
associationRegistry.registerBelongsTo(
  Classroom,
  Block,
  {
    foreignKey: "blockId",
    as: "block",
  },
  MODULE_NAME
);

// Note: The inverse relationships (School.hasMany(Classroom) and Block.hasMany(Classroom))
// should be defined in their respective model-associations.ts files
// to maintain clear ownership

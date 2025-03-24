import Grade from "./model";
import School from "../../schools/model";
import Teacher from "../../teachers/model";
import Class from "../classes/model";
import associationRegistry, {
  AssociationType,
} from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Grade model
// The module name helps with debugging and dependency tracking
const MODULE_NAME = "school_config/grades";

// Grade belongs to School
associationRegistry.registerBelongsTo(
  Grade,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Grade belongs to Teacher (optional)
associationRegistry.registerBelongsTo(
  Grade,
  Teacher,
  {
    foreignKey: "teacherId",
    as: "teacher",
  },
  MODULE_NAME
);

// Grade has many Classes
associationRegistry.registerHasMany(
  Grade,
  Class,
  {
    foreignKey: "gradeId",
    as: "classes",
  },
  MODULE_NAME
);

// Note: The inverse relationships (School.hasMany(Grade), Teacher.hasMany(Grade))
// should be defined in the respective school and teacher model-associations.ts files
// to maintain clear ownership

import Class from "./model";
import School from "../../schools/model";
import Teacher from "../../teachers/model";
import Grade from "../grades/model";
import Section from "../sections/model";
import Department from "../departments/model";
import Classroom from "../classrooms/model";
import associationRegistry, {
  AssociationType,
} from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Class model
// The module name helps with debugging and dependency tracking
const MODULE_NAME = "school_config/classes";

// Class belongs to School
associationRegistry.registerBelongsTo(
  Class,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Class belongs to Teacher (optional)
associationRegistry.registerBelongsTo(
  Class,
  Teacher,
  {
    foreignKey: "teacherId",
    as: "teacher",
  },
  MODULE_NAME
);

// Class belongs to Grade
associationRegistry.registerBelongsTo(
  Class,
  Grade,
  {
    foreignKey: "gradeId",
    as: "grade",
  },
  MODULE_NAME
);

// Class belongs to Section (optional)
associationRegistry.registerBelongsTo(
  Class,
  Section,
  {
    foreignKey: "sectionId",
    as: "section",
  },
  MODULE_NAME
);

// Class belongs to Department (optional)
associationRegistry.registerBelongsTo(
  Class,
  Department,
  {
    foreignKey: "departmentId",
    as: "department",
  },
  MODULE_NAME
);

// Class belongs to Classroom (optional)
associationRegistry.registerBelongsTo(
  Class,
  Classroom,
  {
    foreignKey: "classroomId",
    as: "classroom",
  },
  MODULE_NAME
);

// Note: The inverse relationships (School.hasMany(Class), etc.)
// should be defined in the respective model-associations.ts files
// to maintain clear ownership

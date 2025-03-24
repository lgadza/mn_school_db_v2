import Teacher from "./model";
import User from "../users/model";
import School from "../schools/model";
import Department from "../school_config/departments/model";
import Grade from "../school_config/grades/model";
import associationRegistry from "../../common/utils/db/AssociationRegistry";

// Register all associations for the Teacher model
const MODULE_NAME = "teachers";

// Teacher belongs to User
associationRegistry.registerBelongsTo(
  Teacher,
  User,
  {
    foreignKey: "userId",
    as: "user",
  },
  MODULE_NAME
);

// Teacher belongs to School
associationRegistry.registerBelongsTo(
  Teacher,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Teacher belongs to Department
associationRegistry.registerBelongsTo(
  Teacher,
  Department,
  {
    foreignKey: "departmentId",
    as: "department",
  },
  MODULE_NAME
);

// Teacher has many Grades
associationRegistry.registerHasMany(
  Teacher,
  Grade,
  {
    foreignKey: "teacherId",
    as: "grades",
  },
  MODULE_NAME
);

// Note: The inverse relationships are defined in their respective model-associations files

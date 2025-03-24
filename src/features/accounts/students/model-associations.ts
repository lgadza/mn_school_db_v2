import Student from "./model";
import User from "../../users/model";
import School from "../../schools/model";
import Grade from "../../school_config/grades/model";
// import Class from "../../school_config/classes/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Student model
const MODULE_NAME = "students";

// Student belongs to User
associationRegistry.registerBelongsTo(
  Student,
  User,
  {
    foreignKey: "userId",
    as: "user",
  },
  MODULE_NAME
);

// Student belongs to School
associationRegistry.registerBelongsTo(
  Student,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Student belongs to Grade
associationRegistry.registerBelongsTo(
  Student,
  Grade,
  {
    foreignKey: "gradeId",
    as: "grade",
  },
  MODULE_NAME
);

// Student belongs to Class (optional)
// associationRegistry.registerBelongsTo(
//   Student,
//   Class,
//   {
//     foreignKey: "classId",
//     as: "class",
//   },
//   MODULE_NAME
// );

// Note: The inverse relationships are defined in their respective model-associations files

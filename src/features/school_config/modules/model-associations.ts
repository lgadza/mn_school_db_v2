import Module from "./model";
import School from "../../schools/model";
import Subject from "../subjects/model";
import Class from "../classes/model";
import Teacher from "../../teachers/model";
import User from "../../users/model";
import Classroom from "../classrooms/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Module model
const MODULE_NAME = "school_config/modules";

// Module belongs to School
associationRegistry.registerBelongsTo(
  Module,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Module belongs to Subject
associationRegistry.registerBelongsTo(
  Module,
  Subject,
  {
    foreignKey: "subjectId",
    as: "subject",
  },
  MODULE_NAME
);

// Module belongs to Class
associationRegistry.registerBelongsTo(
  Module,
  Class,
  {
    foreignKey: "classId",
    as: "class",
  },
  MODULE_NAME
);

// Module belongs to Teacher
associationRegistry.registerBelongsTo(
  Module,
  Teacher,
  {
    foreignKey: "teacherId",
    as: "teacher",
  },
  MODULE_NAME
);

// Module belongs to Assistant Teacher (Teacher)
associationRegistry.registerBelongsTo(
  Module,
  Teacher,
  {
    foreignKey: "assistantTeacherId",
    as: "assistantTeacher",
  },
  MODULE_NAME
);

// Module belongs to User (creator)
associationRegistry.registerBelongsTo(
  Module,
  User,
  {
    foreignKey: "createdById",
    as: "creator",
  },
  MODULE_NAME
);

// Module belongs to User (modifier)
associationRegistry.registerBelongsTo(
  Module,
  User,
  {
    foreignKey: "modifiedById",
    as: "modifier",
  },
  MODULE_NAME
);

// Module belongs to Classroom (optional)
associationRegistry.registerBelongsTo(
  Module,
  Classroom,
  {
    foreignKey: "classroomId",
    as: "classroom",
  },
  MODULE_NAME
);

// Note: The inverse relationships should be defined in the respective model-associations.ts files

import Teacher from "./model";
import User from "../users/model";
import School from "../schools/model";
import Department from "../departments/model";

// Define associations
Teacher.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Teacher.belongsTo(School, {
  foreignKey: "schoolId",
  as: "school",
});

Teacher.belongsTo(Department, {
  foreignKey: "departmentId",
  as: "department",
});

// Add reverse associations
User.hasOne(Teacher, {
  foreignKey: "userId",
  as: "teacher",
});

School.hasMany(Teacher, {
  foreignKey: "schoolId",
  as: "teachers",
});

Department.hasMany(Teacher, {
  foreignKey: "departmentId",
  as: "teachers",
});

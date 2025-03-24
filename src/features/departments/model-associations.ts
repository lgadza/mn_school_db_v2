import Department from "./model";
import School from "../schools/model";

// Ensure School has a hasMany relationship to Department
School.hasMany(Department, {
  foreignKey: "schoolId",
  as: "departments",
  onDelete: "CASCADE",
});
// Define associations
Department.belongsTo(School, {
  foreignKey: "schoolId",
  as: "school",
});

import School from "./model";
import Department from "../school_config/departments/model";
import Grade from "../school_config/grades/model";
import Address from "../address/model";
import AddressLink from "../address/address-link.model";
import { registerAlias } from "../association-loader";

// School and Department associations
// Note: The other side of this association is defined in departments/model-associations.ts
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
// School and Grade associations
// Note: The other side of this association is defined in grades/model-associations.ts
School.hasMany(Grade, {
  foreignKey: "schoolId",
  as: "grades",
  onDelete: "CASCADE",
});

// School and Address associations using AddressLink
School.belongsToMany(Address, {
  through: AddressLink,
  foreignKey: "entityId",
  constraints: false,
  scope: {
    entityType: "school",
  },
  as: "addresses",
});

// Register aliases to prevent duplicates
registerAlias("School", "departments");
registerAlias("School", "grades");
registerAlias("School", "addresses");

// Add any other school-related associations here

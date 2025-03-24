import School from "./model";
import Department from "../school_config/departments/model";
import Grade from "../school_config/grades/model";
import Section from "../school_config/sections/model";
import Address from "../address/model";
import AddressLink from "../address/address-link.model";
import Teacher from "../teachers/model";
import Category from "../school_config/categories/model";
import Subject from "../school_config/subjects/model";
import Block from "../school_config/blocks/model";
import associationRegistry from "../../common/utils/db/AssociationRegistry";

// Register all associations for the School model
const MODULE_NAME = "schools";

// School has many Departments
associationRegistry.registerHasMany(
  School,
  Department,
  {
    foreignKey: "schoolId",
    as: "departments",
    onDelete: "CASCADE",
  },
  MODULE_NAME
);

// School has many Grades
associationRegistry.registerHasMany(
  School,
  Grade,
  {
    foreignKey: "schoolId",
    as: "grades",
    onDelete: "CASCADE",
  },
  MODULE_NAME
);

// School has many Sections
associationRegistry.registerHasMany(
  School,
  Section,
  {
    foreignKey: "schoolId",
    as: "sections",
    onDelete: "CASCADE",
  },
  MODULE_NAME
);

// School has many Teachers
associationRegistry.registerHasMany(
  School,
  Teacher,
  {
    foreignKey: "schoolId",
    as: "teachers",
  },
  MODULE_NAME
);

// School has many Categories
associationRegistry.registerHasMany(
  School,
  Category,
  {
    foreignKey: "schoolId",
    as: "categories",
  },
  MODULE_NAME
);

// School has many Subjects
associationRegistry.registerHasMany(
  School,
  Subject,
  {
    foreignKey: "schoolId",
    as: "subjects",
    onDelete: "CASCADE",
  },
  MODULE_NAME
);

// School has many Blocks
associationRegistry.registerHasMany(
  School,
  Block,
  {
    foreignKey: "schoolId",
    as: "blocks",
    onDelete: "CASCADE",
  },
  MODULE_NAME
);

// School has many Addresses (through AddressLink)
associationRegistry.registerBelongsToMany(
  School,
  Address,
  {
    through: AddressLink,
    foreignKey: "entityId",
    constraints: false,
    scope: {
      entityType: "school",
    },
    as: "addresses",
  },
  MODULE_NAME
);

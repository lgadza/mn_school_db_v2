import Prospect from "./model";
import User from "../../users/model";
import School from "../../schools/model";
import Role from "../../rbac/models/roles.model";
import Address from "../../address/model";
import associationRegistry from "../../../common/utils/db/AssociationRegistry";

// Register all associations for the Prospect model
const MODULE_NAME = "prospects";

// Prospect belongs to User
associationRegistry.registerBelongsTo(
  Prospect,
  User,
  {
    foreignKey: "userId",
    as: "user",
  },
  MODULE_NAME
);

// Prospect belongs to School
associationRegistry.registerBelongsTo(
  Prospect,
  School,
  {
    foreignKey: "schoolId",
    as: "school",
  },
  MODULE_NAME
);

// Prospect belongs to Role
associationRegistry.registerBelongsTo(
  Prospect,
  Role,
  {
    foreignKey: "roleId",
    as: "role",
  },
  MODULE_NAME
);

// Prospect belongs to Address
associationRegistry.registerBelongsTo(
  Prospect,
  Address,
  {
    foreignKey: "addressId",
    as: "address",
  },
  MODULE_NAME
);

export default () => {
  // This function will be called when loading all associations
  // It doesn't need to do anything as the associations are registered above
};

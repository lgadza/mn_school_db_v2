import School from "./model";
import SchoolAddress from "./address-link.model";
import Address from "../address/model";

/**
 * Initialize the associations between School and SchoolAddress models
 * This is in a separate file to avoid circular dependencies
 */
export function initializeAssociations(): void {
  // School has many SchoolAddresses
  School.hasMany(SchoolAddress, {
    foreignKey: "schoolId",
    as: "addresses",
  });

  // SchoolAddress belongs to School
  SchoolAddress.belongsTo(School, {
    foreignKey: "schoolId",
    as: "school",
  });

  // SchoolAddress belongs to Address
  SchoolAddress.belongsTo(Address, {
    foreignKey: "addressId",
    as: "address",
  });
}

// Initialize all associations
initializeAssociations();

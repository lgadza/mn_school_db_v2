import Address from "./model";
import AddressLink from "./address-link.model";
import { registerAlias } from "../association-loader";

// Register aliases to prevent conflicts
registerAlias("Address", "links");
registerAlias("AddressLink", "address");

// Address-AddressLink associations
Address.hasMany(AddressLink, {
  foreignKey: "addressId",
  as: "links",
});

AddressLink.belongsTo(Address, {
  foreignKey: "addressId",
  as: "address",
});

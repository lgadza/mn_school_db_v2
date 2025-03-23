/**
 * Base Address interface
 */
export interface AddressInterface {
  id: string;
  buildingNumber: string;
  street: string;
  city: string;
  province: string;
  addressLine2?: string | null;
  postalCode?: string | null;
  country: string;
}

/**
 * Address ownership interface - used for linking addresses to other entities
 */
export interface AddressLinkInterface {
  id: string;
  addressId: string;
  entityId: string;
  entityType: string; // The type of entity this address is linked to (e.g., 'user', 'school')
  addressType: string; // Type of address (e.g., 'billing', 'shipping', 'home', 'work')
  isPrimary: boolean; // Whether this is the primary address for the entity
}

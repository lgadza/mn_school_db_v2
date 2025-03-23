import { AddressInterface } from "./interfaces/interfaces";

/**
 * Base DTO for address information
 */
export interface AddressBaseDTO {
  id: string;
  buildingNumber: string;
  street: string;
  city: string;
  province: string;
  addressLine2: string | null;
  postalCode: string | null;
  country: string;
  formattedAddress: string;
}

/**
 * Detailed address DTO with timestamps
 */
export interface AddressDetailDTO extends AddressBaseDTO {
  createdAt: string;
  updatedAt: string;
}

/**
 * Simple address DTO without timestamps
 */
export interface AddressSimpleDTO extends AddressBaseDTO {}

/**
 * DTO for creating a new address
 */
export interface CreateAddressDTO {
  buildingNumber: string;
  street: string;
  city: string;
  province: string;
  addressLine2?: string | null;
  postalCode?: string | null;
  country: string;
}

/**
 * DTO for updating an address
 */
export interface UpdateAddressDTO {
  buildingNumber?: string;
  street?: string;
  city?: string;
  province?: string;
  addressLine2?: string | null;
  postalCode?: string | null;
  country?: string;
}

/**
 * DTO for address linking
 */
export interface AddressLinkDTO {
  id: string;
  addressId: string;
  entityId: string;
  entityType: string;
  addressType: string;
  isPrimary: boolean;
  address: AddressDetailDTO;
}

/**
 * DTO for creating a address link
 */
export interface CreateAddressLinkDTO {
  addressId: string;
  entityId: string;
  entityType: string;
  addressType: string;
  isPrimary?: boolean;
}

/**
 * Query parameters for address list
 */
export interface AddressListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  city?: string;
  province?: string;
  country?: string;
}

/**
 * Paginated address list response
 */
export interface PaginatedAddressListDTO {
  addresses: AddressDetailDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Mapper class for converting between Address entities and DTOs
 */
export class AddressDTOMapper {
  /**
   * Map Address entity to BaseDTO
   */
  public static toBaseDTO(address: AddressInterface): AddressBaseDTO {
    return {
      id: address.id,
      buildingNumber: address.buildingNumber,
      street: address.street,
      city: address.city,
      province: address.province,
      addressLine2: address.addressLine2 || null,
      postalCode: address.postalCode || null,
      country: address.country,
      formattedAddress: this.getFormattedAddress(address),
    };
  }

  /**
   * Map Address entity to DetailDTO
   */
  public static toDetailDTO(address: any): AddressDetailDTO {
    return {
      ...this.toBaseDTO(address),
      createdAt: address.createdAt
        ? address.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: address.updatedAt
        ? address.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }

  /**
   * Map Address entity to SimpleDTO
   */
  public static toSimpleDTO(address: AddressInterface): AddressSimpleDTO {
    return this.toBaseDTO(address);
  }

  /**
   * Create a formatted address string
   */
  private static getFormattedAddress(address: AddressInterface): string {
    let formattedAddress = `${address.buildingNumber} ${address.street}`;

    if (address.addressLine2) {
      formattedAddress += `, ${address.addressLine2}`;
    }

    formattedAddress += `, ${address.city}, ${address.province}`;

    if (address.postalCode) {
      formattedAddress += ` ${address.postalCode}`;
    }

    formattedAddress += `, ${address.country}`;

    return formattedAddress;
  }
}

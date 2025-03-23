import { AddressInterface, AddressLinkInterface } from "./interfaces";
import {
  AddressDetailDTO,
  CreateAddressDTO,
  UpdateAddressDTO,
  PaginatedAddressListDTO,
  AddressListQueryParams,
  AddressLinkDTO,
  CreateAddressLinkDTO,
} from "../dto";
import { Transaction } from "sequelize";

export interface IAddressRepository {
  /**
   * Find an address by ID
   */
  findAddressById(id: string): Promise<AddressInterface | null>;

  /**
   * Create a new address
   */
  createAddress(
    addressData: CreateAddressDTO,
    transaction?: Transaction
  ): Promise<AddressInterface>;

  /**
   * Update an address
   */
  updateAddress(
    id: string,
    addressData: UpdateAddressDTO,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete an address
   */
  deleteAddress(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Get address list with filtering and pagination
   */
  getAddressList(params: AddressListQueryParams): Promise<{
    addresses: AddressInterface[];
    total: number;
  }>;

  /**
   * Find addresses for an entity
   */
  findAddressesByEntity(
    entityId: string,
    entityType: string
  ): Promise<(AddressInterface & { link?: AddressLinkInterface })[]>;

  /**
   * Find a specific address type for an entity
   */
  findAddressByType(
    entityId: string,
    entityType: string,
    addressType: string
  ): Promise<(AddressInterface & { link?: AddressLinkInterface }) | null>;

  /**
   * Create an address link
   */
  createAddressLink(
    linkData: CreateAddressLinkDTO,
    transaction?: Transaction
  ): Promise<AddressLinkInterface>;

  /**
   * Update an address link
   */
  updateAddressLink(
    id: string,
    isPrimary: boolean,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete an address link
   */
  deleteAddressLink(id: string, transaction?: Transaction): Promise<boolean>;

  /**
   * Find an address link by ID
   */
  findAddressLinkById(
    id: string
  ): Promise<(AddressLinkInterface & { address?: AddressInterface }) | null>;

  /**
   * Get address links for an entity
   */
  getAddressLinks(
    entityId: string,
    entityType: string
  ): Promise<(AddressLinkInterface & { address?: AddressInterface })[]>;

  /**
   * Find primary address for an entity and type
   */
  findPrimaryAddress(
    entityId: string,
    entityType: string,
    addressType?: string
  ): Promise<(AddressInterface & { link?: AddressLinkInterface }) | null>;

  /**
   * Check if an address is in use by any entity
   */
  isAddressInUse(addressId: string): Promise<boolean>;
}

export interface IAddressService {
  /**
   * Get address by ID
   */
  getAddressById(id: string): Promise<AddressDetailDTO>;

  /**
   * Create a new address
   */
  createAddress(addressData: CreateAddressDTO): Promise<AddressDetailDTO>;

  /**
   * Update an address
   */
  updateAddress(
    id: string,
    addressData: UpdateAddressDTO
  ): Promise<AddressDetailDTO>;

  /**
   * Delete an address
   */
  deleteAddress(id: string): Promise<boolean>;

  /**
   * Get paginated address list
   */
  getAddressList(
    params: AddressListQueryParams
  ): Promise<PaginatedAddressListDTO>;

  /**
   * Get addresses for an entity
   */
  getEntityAddresses(
    entityId: string,
    entityType: string
  ): Promise<AddressLinkDTO[]>;

  /**
   * Get a specific address type for an entity
   */
  getEntityAddressByType(
    entityId: string,
    entityType: string,
    addressType: string
  ): Promise<AddressLinkDTO | null>;

  /**
   * Link an address to an entity
   */
  linkAddressToEntity(linkData: CreateAddressLinkDTO): Promise<AddressLinkDTO>;

  /**
   * Create and link a new address to an entity
   */
  createAndLinkAddress(
    addressData: CreateAddressDTO,
    entityId: string,
    entityType: string,
    addressType: string,
    isPrimary?: boolean
  ): Promise<AddressLinkDTO>;

  /**
   * Update address link (e.g., set as primary)
   */
  updateAddressLink(id: string, isPrimary: boolean): Promise<AddressLinkDTO>;

  /**
   * Remove address link
   */
  unlinkAddress(linkId: string): Promise<boolean>;

  /**
   * Get primary address for an entity
   */
  getEntityPrimaryAddress(
    entityId: string,
    entityType: string,
    addressType?: string
  ): Promise<AddressLinkDTO | null>;

  /**
   * Validate postal code format for a country
   */
  validatePostalCode(postalCode: string, country: string): boolean;
}

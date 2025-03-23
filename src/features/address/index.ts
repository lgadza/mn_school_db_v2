import Address from "./model";
import AddressLink from "./address-link.model";
import addressService from "./service";
import addressController from "./controller";
import addressRepository from "./repository";
import addressValidationSchemas from "./validation";
import addressRoutes from "./routes";
import {
  AddressInterface,
  AddressLinkInterface,
} from "./interfaces/interfaces";
import {
  AddressBaseDTO,
  AddressDetailDTO,
  AddressSimpleDTO,
  CreateAddressDTO,
  UpdateAddressDTO,
  AddressLinkDTO,
  CreateAddressLinkDTO,
  AddressListQueryParams,
  PaginatedAddressListDTO,
  AddressDTOMapper,
} from "./dto";
import { IAddressRepository, IAddressService } from "./interfaces/services";

export {
  Address,
  AddressLink,
  addressService,
  addressController,
  addressRepository,
  addressValidationSchemas,
  addressRoutes,
  AddressInterface,
  AddressLinkInterface,
  AddressBaseDTO,
  AddressDetailDTO,
  AddressSimpleDTO,
  CreateAddressDTO,
  UpdateAddressDTO,
  AddressLinkDTO,
  CreateAddressLinkDTO,
  AddressListQueryParams,
  PaginatedAddressListDTO,
  AddressDTOMapper,
  IAddressRepository,
  IAddressService,
};

export default Address;

import { RoleInterface } from "../interfaces";

export interface RoleResponseDTO extends RoleInterface {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoleListResponseDTO {
  roles: RoleResponseDTO[];
  count: number;
}

export interface RoleWithPermissionsDTO extends RoleResponseDTO {
  permissions: string[];
}

export interface AddPermissionsDTO {
  permissionIds: string[];
}

export interface RemovePermissionsDTO {
  permissionIds: string[];
}

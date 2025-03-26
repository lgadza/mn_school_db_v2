import { RoleInterface, PermissionAction } from "../interfaces/roles.interface";

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

/**
 * Interface for detailed role information including timestamps and permissions
 */
export interface RoleDetailDTO {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: {
    id: string;
    name: string;
    resource: string;
    action: PermissionAction;
    description: string | null;
  }[];
}

/**
 * Interface for simplified role information
 */
export interface RoleSimpleDTO {
  id: string;
  name: string;
  description: string | null;
}

/**
 * Mapper class for Role entities to DTOs
 */
export class RoleDTOMapper {
  /**
   * Convert a Role entity to a RoleDetailDTO
   */
  public static toDTO(role: any): RoleDetailDTO {
    return {
      id: role.id,
      name: role.name,
      description: role.description || null,
      createdAt: role.createdAt
        ? role.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: role.updatedAt
        ? role.updatedAt.toISOString()
        : new Date().toISOString(),
      permissions: role.permissions
        ? role.permissions.map((permission: any) => ({
            id: permission.id,
            name: permission.name,
            resource: permission.resource,
            action: permission.action,
            description: permission.description || null,
          }))
        : [],
    };
  }

  /**
   * Convert a Role entity to a simplified DTO
   */
  public static toSimpleDTO(role: any): RoleSimpleDTO {
    return {
      id: role.id,
      name: role.name,
      description: role.description || null,
    };
  }
}

/**
 * RBAC Interfaces
 */

// Basic role structure
export interface RoleInterface {
  id: string;
  name: string;
  description?: string;
}

// Role creation input
export interface CreateRoleDto {
  name: string;
  description?: string;
}

// Role update input
export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

// Permission action types
export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage",
}

// Basic permission structure
export interface PermissionInterface {
  id: string;
  name: string;
  resource: string;
  action: PermissionAction;
  description?: string;
}

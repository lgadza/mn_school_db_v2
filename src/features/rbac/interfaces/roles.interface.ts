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

/**
 * Permission actions enum
 *
 * Hierarchy of actions (from highest to lowest):
 * - MANAGE: Comprehensive permission that implies all other actions except DELETE
 * - DELETE: Ability to permanently remove resources
 * - Other actions: Specific capabilities for the resource
 */
export enum PermissionAction {
  CREATE = "create", // Create new instances of a resource
  READ = "read", // View/read a resource
  UPDATE = "update", // Modify existing resources
  DELETE = "delete", // Remove resources (highest risk action)
  MANAGE = "manage", // Comprehensive control (implies CREATE, READ, UPDATE, etc. but NOT DELETE)
  APPROVE = "approve", // Approve pending items/requests
  REJECT = "reject", // Reject pending items/requests
  VIEW_REPORTS = "view_reports", // Access to reporting features
  DOWNLOAD_DATA = "download_data", // Export data to files
  EXPORT = "export", // Export resources to external format
  IMPORT = "import", // Import resources from external format
  ARCHIVE = "archive", // Move to archive/inactive state
  RESTORE = "restore", // Restore from archive/inactive state
  PUBLISH = "publish", // Make resources public/visible
  UNPUBLISH = "unpublish", // Make resources private/hidden
  ASSIGN = "assign", // Assign resources to users/entities
  TRANSFER = "transfer", // Transfer ownership/responsibility
}

export interface IRoleRepository {
  findAll(): Promise<RoleInterface[]>;
  findById(id: string): Promise<RoleInterface | null>;
  findByName(name: string): Promise<RoleInterface | null>;
  create(data: CreateRoleDto): Promise<RoleInterface>;
  update(id: string, data: UpdateRoleDto): Promise<RoleInterface | null>;
  delete(id: string): Promise<boolean>;
  addPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<boolean>;
  removePermissionsFromRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<boolean>;
  getRolePermissions(roleId: string): Promise<string[]>;
}

export interface IRoleService {
  getAllRoles(): Promise<RoleInterface[]>;
  getRoleById(id: string): Promise<RoleInterface>;
  createRole(data: CreateRoleDto): Promise<RoleInterface>;
  updateRole(id: string, data: UpdateRoleDto): Promise<RoleInterface>;
  deleteRole(id: string): Promise<boolean>;
  addPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<boolean>;
  removePermissionsFromRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<boolean>;
  getRolePermissions(roleId: string): Promise<string[]>;
}

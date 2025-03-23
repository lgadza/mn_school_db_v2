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
export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage",
  APPROVE = "approve",
  REJECT = "reject",
  VIEW_REPORTS = "view_reports",
  DOWNLOAD_DATA = "download_data",
  EXPORT = "export",
  IMPORT = "import",
  ARCHIVE = "archive",
  RESTORE = "restore",
  PUBLISH = "publish",
  UNPUBLISH = "unpublish",
  ASSIGN = "assign",
  TRANSFER = "transfer",
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

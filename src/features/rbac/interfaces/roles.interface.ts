import { RoleInterface, CreateRoleDto, UpdateRoleDto } from "./index";

export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
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

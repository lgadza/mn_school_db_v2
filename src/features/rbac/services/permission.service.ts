import { PermissionAction } from "../interfaces/roles.interface";
import Permission from "../models/permissions.model";
import RolePermission from "../models/role-permission.model";

/**
 * Define which permissions are implied by higher-level permissions
 */
const permissionHierarchy: Record<PermissionAction, PermissionAction[]> = {
  // MANAGE implies most other actions except DELETE
  [PermissionAction.MANAGE]: [
    PermissionAction.CREATE,
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.APPROVE,
    PermissionAction.REJECT,
    PermissionAction.VIEW_REPORTS,
    PermissionAction.DOWNLOAD_DATA,
    PermissionAction.EXPORT,
    PermissionAction.IMPORT,
    PermissionAction.ARCHIVE,
    PermissionAction.RESTORE,
    PermissionAction.PUBLISH,
    PermissionAction.UNPUBLISH,
    PermissionAction.ASSIGN,
    PermissionAction.TRANSFER,
  ],
  // No other permissions have implied permissions
  [PermissionAction.CREATE]: [],
  [PermissionAction.READ]: [],
  [PermissionAction.UPDATE]: [],
  [PermissionAction.DELETE]: [],
  [PermissionAction.APPROVE]: [],
  [PermissionAction.REJECT]: [],
  [PermissionAction.VIEW_REPORTS]: [],
  [PermissionAction.DOWNLOAD_DATA]: [],
  [PermissionAction.EXPORT]: [],
  [PermissionAction.IMPORT]: [],
  [PermissionAction.ARCHIVE]: [],
  [PermissionAction.RESTORE]: [],
  [PermissionAction.PUBLISH]: [],
  [PermissionAction.UNPUBLISH]: [],
  [PermissionAction.ASSIGN]: [],
  [PermissionAction.TRANSFER]: [],
};

/**
 * Service for handling permission-related operations
 */
class PermissionService {
  /**
   * Check if a user has permission for a specific action on a resource
   * Takes into account permission hierarchy
   */
  static async hasPermission(
    userId: string,
    resource: string,
    action: PermissionAction
  ): Promise<boolean> {
    // Get all user's role-permissions
    const userRolePermissions = await this.getUserRolePermissions(userId);

    // First check for the exact permission
    const hasExactPermission = userRolePermissions.some(
      (perm) => perm.resource === resource && perm.action === action
    );

    if (hasExactPermission) {
      return true;
    }

    // Check for implied permissions based on hierarchy
    return userRolePermissions.some((perm) => {
      if (perm.resource !== resource) {
        return false;
      }

      // Check if this permission implies the requested action
      const impliedActions =
        permissionHierarchy[perm.action as PermissionAction];
      return impliedActions.includes(action);
    });
  }

  /**
   * Get all permissions associated with a user through their roles
   */
  private static async getUserRolePermissions(
    userId: string
  ): Promise<Permission[]> {
    // This implementation depends on how users are associated with roles
    // This is a placeholder - you'll need to adapt it to your user-role relationship

    // Example implementation:
    // 1. Get user's roles
    // const userRoles = await UserRole.findAll({ where: { userId } });
    // const roleIds = userRoles.map(ur => ur.roleId);

    // 2. Get role-permission mappings
    // const rolePermissionMappings = await RolePermission.findAll({
    //   where: { roleId: roleIds }
    // });

    // 3. Get the actual permissions
    // const permissionIds = rolePermissionMappings.map(rpm => rpm.permissionId);
    // return Permission.findAll({ where: { id: permissionIds } });

    // Placeholder return:
    return [];
  }
}

export default PermissionService;

import { UserInterface, UserRoleInterface } from "../interfaces";
import {
  UserDetailDTO,
  UserListItemDTO,
  CreateUserDTO,
  UpdateUserDTO,
  PaginatedUserListDTO,
  UserListQueryParams,
  RoleDTO,
  PermissionDTO,
} from "../dto";
import { Transaction } from "sequelize";

export interface IUserRepository {
  /**
   * Find a user by ID with roles
   */
  findUserById(
    id: string
  ): Promise<(UserInterface & { roles?: any[]; permissions?: any[] }) | null>;

  /**
   * Find a user by email
   */
  findUserByEmail(email: string): Promise<UserInterface | null>;

  /**
   * Find a user by username
   */
  findUserByUsername(username: string): Promise<UserInterface | null>;

  /**
   * Create a new user
   */
  createUser(
    userData: Partial<UserInterface>,
    transaction?: Transaction
  ): Promise<UserInterface>;

  /**
   * Update a user
   */
  updateUser(
    id: string,
    userData: Partial<UserInterface>,
    transaction?: Transaction
  ): Promise<boolean>;

  /**
   * Delete a user (soft delete by setting isActive to false)
   */
  softDeleteUser(id: string): Promise<boolean>;

  /**
   * Hard delete a user (permanent)
   */
  hardDeleteUser(id: string): Promise<boolean>;

  /**
   * Get user list with filtering and pagination
   */
  getUserList(params: UserListQueryParams): Promise<{
    users: (UserInterface & { roles?: any[] })[];
    total: number;
  }>;

  /**
   * Update user password
   */
  updatePassword(id: string, password: string): Promise<boolean>;

  /**
   * Get user roles
   */
  getUserRoles(userId: string): Promise<RoleDTO[]>;

  /**
   * Get user permissions
   */
  getUserPermissions(userId: string): Promise<PermissionDTO[]>;

  /**
   * Add roles to user
   */
  addRolesToUser(
    userId: string,
    roleIds: string[],
    transaction?: Transaction
  ): Promise<void>;

  /**
   * Remove roles from user
   */
  removeRolesFromUser(
    userId: string,
    roleIds: string[],
    transaction?: Transaction
  ): Promise<void>;

  /**
   * Set user roles (replace existing)
   */
  setUserRoles(
    userId: string,
    roleIds: string[],
    transaction?: Transaction
  ): Promise<void>;

  /**
   * Update user avatar
   */
  updateAvatar(userId: string, avatarUrl: string): Promise<boolean>;

  /**
   * Check if user has specific role
   */
  hasRole(userId: string, roleName: string): Promise<boolean>;
}

export interface IUserService {
  /**
   * Get user by ID
   */
  getUserById(id: string): Promise<UserDetailDTO>;

  /**
   * Create a new user
   */
  createUser(userData: CreateUserDTO): Promise<UserDetailDTO>;

  /**
   * Update a user
   */
  updateUser(id: string, userData: UpdateUserDTO): Promise<UserDetailDTO>;

  /**
   * Delete a user (soft delete)
   */
  deleteUser(id: string): Promise<boolean>;

  /**
   * Get paginated user list
   */
  getUserList(params: UserListQueryParams): Promise<PaginatedUserListDTO>;

  /**
   * Update user password
   */
  updatePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean>;

  /**
   * Admin update user password without requiring current password
   */
  adminUpdatePassword(
    id: string,
    password: string,
    sendEmail?: boolean
  ): Promise<boolean>;

  /**
   * Update user roles
   */
  updateUserRoles(
    userId: string,
    roleIds: string[],
    operation: "add" | "remove" | "set"
  ): Promise<UserDetailDTO>;

  /**
   * Upload and update user avatar
   */
  updateAvatar(
    userId: string,
    avatarFile: Express.Multer.File
  ): Promise<string>;

  /**
   * Check if user exists by email
   */
  userExistsByEmail(email: string): Promise<boolean>;

  /**
   * Check if user exists by username
   */
  userExistsByUsername(username: string): Promise<boolean>;
}

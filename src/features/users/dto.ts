import { UserInterface } from "./interfaces";

// Base DTO for user information
export interface UserBaseDTO {
  id: string;
  username: string;
  email: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string | null;
  phoneNumber: string;
  gender: string | null;
  dateOfBirth: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

// Extended DTO with roles and permissions
export interface UserDetailDTO extends UserBaseDTO {
  roles: RoleDTO[];
  permissions: PermissionDTO[];
  schoolId: string | null;
  countryCode: string | null;
}

// Simplified DTO for list view
export interface UserListItemDTO {
  id: string;
  username: string;
  email: string | null;
  fullName: string;
  avatar: string | null;
  isActive: boolean;
  roles: string[];
  lastLogin: string | null;
  createdAt: string;
}

// DTO for user creation
export interface CreateUserDTO {
  email: string;
  username?: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender?: string;
  dateOfBirth?: string;
  countryCode?: string;
  isActive?: boolean;
  roles?: string[]; // Role IDs
  schoolId?: string;
  avatar?: string;
}

// DTO for user updates
export interface UpdateUserDTO {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  countryCode?: string;
  isActive?: boolean;
  roles?: string[]; // Role IDs
  schoolId?: string;
  avatar?: string;
}

// DTO for password update
export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// DTO for admin updating user password
export interface AdminUpdatePasswordDTO {
  password: string;
  sendEmail?: boolean;
}

// DTO for role information
export interface RoleDTO {
  id: string;
  name: string;
  description: string;
}

// DTO for permission information
export interface PermissionDTO {
  id: string;
  resource: string;
  action: string;
  description: string;
}

// Response for paginated user list
export interface PaginatedUserListDTO {
  users: UserListItemDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Query parameters for user list
export interface UserListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  role?: string;
  createdAfter?: string;
  createdBefore?: string;
}

// Mapper functions for converting between models and DTOs
export class UserDTOMapper {
  /**
   * Map User entity to UserBaseDTO
   */
  public static toBaseDTO(
    user: UserInterface,
    includeTimestamps = true
  ): UserBaseDTO {
    const baseDTO: any = {
      id: user.id,
      username: user.username || "",
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || null,
      phoneNumber: user.phoneNumber,
      gender: user.gender || null,
      dateOfBirth: user.dateOfBirth
        ? user.dateOfBirth.toISOString().split("T")[0]
        : null,
      isActive: user.isActive,
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    };

    if (includeTimestamps && (user as any).createdAt) {
      baseDTO.createdAt = (user as any).createdAt.toISOString();
      baseDTO.updatedAt = (user as any).updatedAt.toISOString();
    }

    return baseDTO;
  }

  /**
   * Map User entity to UserDetailDTO
   */
  public static toDetailDTO(
    user: UserInterface & { roles?: any[]; permissions?: any[] },
    roles: RoleDTO[] = [],
    permissions: PermissionDTO[] = []
  ): UserDetailDTO {
    const baseDTO = this.toBaseDTO(user);
    return {
      ...baseDTO,
      roles: roles,
      permissions: permissions,
      schoolId: (user as any).schoolId || null,
      countryCode: (user as any).countryCode || null,
    };
  }

  /**
   * Map User entity to UserListItemDTO
   */
  public static toListItemDTO(
    user: UserInterface & { roles?: any[] }
  ): UserListItemDTO {
    return {
      id: user.id,
      username: user.username || "",
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || null,
      isActive: user.isActive,
      roles: user.roles ? user.roles.map((role: any) => role.name) : [],
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
      createdAt: (user as any).createdAt
        ? (user as any).createdAt.toISOString()
        : new Date().toISOString(),
    };
  }
}

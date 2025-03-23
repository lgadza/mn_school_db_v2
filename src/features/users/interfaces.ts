export interface UserInterface {
  id: string;
  email: string | null;
  username?: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar?: string | null;
  isActive: boolean;
  gender?: string | null;
  dateOfBirth?: Date | null;
  lastLogin?: Date | null;
  countryCode?: string | null;
  schoolId?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  verifyPassword?: (password: string) => Promise<boolean>;
}

export interface UserRoleInterface {
  userId: string;
  roleId: string;
}

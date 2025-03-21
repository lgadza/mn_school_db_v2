export interface UserInterface {
  id: string;
  username: string;
  email: string | null;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin?: Date;
  avatar?: string | null;
  schoolId?: string | undefined;
  gender?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  dateOfBirth?: Date | null;
  countryCode?: string | null;
  phoneNumber: string;

  // Add this method to fix the TypeScript error
  verifyPassword(password: string): Promise<boolean>;
}

export interface UserRoleInterface {
  userId: string;
  roleId: string;
}

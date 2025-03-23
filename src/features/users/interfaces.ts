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
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  // Make verifyPassword optional using '?' since it's a method that is added by the model
  // rather than a field that would be passed in user creation data
  verifyPassword?: (password: string) => Promise<boolean>;
}

export interface UserRoleInterface {
  userId: string;
  roleId: string;
}

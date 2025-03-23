import { UserInterface } from "@/features/users/interfaces";
import { AuthResponseDTO, UserInfoDTO } from "../dto";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<UserInterface | null>;
  findUserById(id: string): Promise<UserInterface | null>;
  createUser(userData: Partial<UserInterface>): Promise<UserInterface>;
  updateLastLogin(userId: string): Promise<void>;
  savePasswordResetToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<void>;
  findUserByResetToken(token: string): Promise<UserInterface | null>;
  clearPasswordResetToken(userId: string): Promise<void>;
  associateUserWithRole(userId: string, roleId: string): Promise<void>;
  getDefaultRoleId(): Promise<string>;
  updatePasswordAndClearResetToken(
    userId: string,
    newPassword: string
  ): Promise<void>;
}

export interface IAuthService {
  register(userData: Partial<UserInterface>): Promise<AuthResponseDTO>;
  login(email: string, password: string): Promise<AuthResponseDTO>;
  refreshToken(refreshToken: string): Promise<AuthResponseDTO>;
  logout(userId: string, refreshToken: string): Promise<boolean>;
  getCurrentUser(userId: string): Promise<UserInfoDTO>;
  requestPasswordReset(email: string): Promise<boolean>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  verifyEmail(token: string): Promise<boolean>;

  /**
   * Check if an email is registered in the system
   * @param email Email to check
   * @returns Boolean indicating if the email is registered
   */
  isEmailRegistered(email: string): Promise<boolean>;
}

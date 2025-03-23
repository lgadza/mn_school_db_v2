export interface RegisterRequestDTO {
  email: string;
  username?: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender?: string;
  dateOfBirth?: string | Date;
  countryCode?: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface ResetPasswordRequestDTO {
  token: string;
  password: string;
}

export interface UserInfoDTO {
  id: string;
  email: string | null;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string | null;
  phoneNumber: string;
  gender: string | null;
  dateOfBirth: string | null;
  roles: string[];
  permissions: string[];
  lastLogin: string | null;
}

export interface AuthResponseDTO {
  user: UserInfoDTO;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RequestPasswordResetDTO {
  email: string;
}

export interface VerifyEmailDTO {
  token: string;
}

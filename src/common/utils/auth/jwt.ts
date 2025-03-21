import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { appConfig } from "@/config";
import logger from "@/common/utils/logging/logger";
import redis from "@/config/redis";

/**
 * Token types
 */
export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  RESET_PASSWORD = "reset_password",
  EMAIL_VERIFICATION = "email_verification",
}

/**
 * Token payload interface
 */
export interface TokenPayload {
  userId: string;
  email?: string;
  role?: string;
  permissions?: string[];
  type: TokenType;
  jti: string; // JWT ID (unique identifier)
  iat?: number; // Issued at timestamp
  exp?: number; // Expiration timestamp
}

/**
 * Token verification result interface
 */
export interface VerificationResult {
  isValid: boolean;
  payload?: TokenPayload;
  error?: string;
}

/**
 * JWT Authentication Utility
 * Provides standardized methods for JWT operations with security best practices
 */
export class JwtUtil {
  private static readonly JWT_SECRET = appConfig.security.jwtSecret;
  private static readonly JWT_EXPIRES_IN = appConfig.security.jwtExpiresIn;
  private static readonly REFRESH_TOKEN_EXPIRES_IN = "7d";
  private static readonly TOKEN_BLACKLIST_PREFIX = "token:blacklist:";
  private static readonly TOKEN_WHITELIST_PREFIX = "token:whitelist:";

  /**
   * Generate a JWT token
   *
   * @param payload - Token payload
   * @param expiresIn - Token expiration time
   * @returns Generated token
   */
  public static generateToken(
    payload: Omit<TokenPayload, "jti" | "iat" | "exp">,
    expiresIn: string = this.JWT_EXPIRES_IN
  ): string {
    try {
      // Add unique JWT ID to prevent replay attacks
      const jti = uuidv4();

      const token = jwt.sign({ ...payload, jti }, this.JWT_SECRET, {
        expiresIn,
      } as SignOptions);

      // For refresh tokens and some special tokens, we want to whitelist them
      if (
        payload.type === TokenType.REFRESH ||
        payload.type === TokenType.RESET_PASSWORD ||
        payload.type === TokenType.EMAIL_VERIFICATION
      ) {
        this.whitelistToken(jti, payload.userId, expiresIn);
      }

      return token;
    } catch (error) {
      logger.error("Error generating JWT token:", error);
      throw new Error("Failed to generate authentication token");
    }
  }

  /**
   * Generate access and refresh tokens
   *
   * @param userId - User ID
   * @param email - User email
   * @param role - User role
   * @param permissions - User permissions
   * @returns Access and refresh tokens
   */
  public static generateTokenPair(
    userId: string,
    email?: string,
    role?: string,
    permissions?: string[]
  ): { accessToken: string; refreshToken: string } {
    const accessToken = this.generateToken(
      {
        userId,
        email,
        role,
        permissions,
        type: TokenType.ACCESS,
      },
      this.JWT_EXPIRES_IN
    );

    const refreshToken = this.generateToken(
      {
        userId,
        type: TokenType.REFRESH,
      },
      this.REFRESH_TOKEN_EXPIRES_IN
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify a JWT token
   *
   * @param token - JWT token
   * @returns Verification result
   */
  public static async verifyToken(token: string): Promise<VerificationResult> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;

      // Check if token is blacklisted
      if (await this.isTokenBlacklisted(decoded.jti)) {
        return {
          isValid: false,
          error: "Token has been revoked",
        };
      }

      // For whitelisted token types, check if they are in the whitelist
      if (
        (decoded.type === TokenType.REFRESH ||
          decoded.type === TokenType.RESET_PASSWORD ||
          decoded.type === TokenType.EMAIL_VERIFICATION) &&
        !(await this.isTokenWhitelisted(decoded.jti))
      ) {
        return {
          isValid: false,
          error: "Token is not valid",
        };
      }

      return {
        isValid: true,
        payload: decoded,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          isValid: false,
          error: "Token has expired",
        };
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return {
          isValid: false,
          error: "Invalid token",
        };
      }

      logger.error("Error verifying JWT token:", error);
      return {
        isValid: false,
        error: "Failed to verify token",
      };
    }
  }

  /**
   * Refresh an access token using a refresh token
   *
   * @param refreshToken - Refresh token
   * @returns New access token or null if invalid
   */
  public static async refreshAccessToken(
    refreshToken: string
  ): Promise<string | null> {
    const verificationResult = await this.verifyToken(refreshToken);

    if (!verificationResult.isValid || !verificationResult.payload) {
      return null;
    }

    const { payload } = verificationResult;

    if (payload.type !== TokenType.REFRESH) {
      return null;
    }

    // Revoke the used refresh token to prevent refresh token reuse
    await this.revokeToken(refreshToken);

    // Generate a new access token
    return this.generateToken(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        type: TokenType.ACCESS,
      },
      this.JWT_EXPIRES_IN
    );
  }

  /**
   * Revoke a token (add to blacklist)
   *
   * @param token - JWT token
   * @returns Whether the operation was successful
   */
  public static async revokeToken(token: string): Promise<boolean> {
    try {
      const verificationResult = await this.verifyToken(token);

      if (!verificationResult.isValid || !verificationResult.payload) {
        return false;
      }

      const { payload } = verificationResult;

      // Calculate token expiration
      const expirationTime =
        payload.exp || Math.floor(Date.now() / 1000) + 3600;
      const currentTime = Math.floor(Date.now() / 1000);
      const ttl = Math.max(0, expirationTime - currentTime);

      // Add to blacklist with TTL to auto-expire
      const blacklistKey = `${this.TOKEN_BLACKLIST_PREFIX}${payload.jti}`;
      await redis.set(blacklistKey, "1", "EX", ttl);

      // If it's a whitelisted token type, remove from whitelist
      if (
        payload.type === TokenType.REFRESH ||
        payload.type === TokenType.RESET_PASSWORD ||
        payload.type === TokenType.EMAIL_VERIFICATION
      ) {
        const whitelistKey = `${this.TOKEN_WHITELIST_PREFIX}${payload.jti}`;
        await redis.del(whitelistKey);
      }

      return true;
    } catch (error) {
      logger.error("Error revoking token:", error);
      return false;
    }
  }

  /**
   * Revoke all tokens for a user
   *
   * @param userId - User ID
   * @returns Whether the operation was successful
   */
  public static async revokeAllUserTokens(userId: string): Promise<boolean> {
    try {
      const pattern = `${this.TOKEN_WHITELIST_PREFIX}*:${userId}`;
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        // Add all tokens to blacklist
        for (const key of keys) {
          const jti = key
            .replace(this.TOKEN_WHITELIST_PREFIX, "")
            .split(":")[0];
          const ttl = await redis.ttl(key);

          if (ttl > 0) {
            const blacklistKey = `${this.TOKEN_BLACKLIST_PREFIX}${jti}`;
            await redis.set(blacklistKey, "1", "EX", ttl);
          }
        }

        // Remove all from whitelist
        await redis.del(...keys);
      }

      return true;
    } catch (error) {
      logger.error("Error revoking all user tokens:", error);
      return false;
    }
  }

  /**
   * Check if a token is blacklisted
   *
   * @param jti - JWT ID
   * @returns Whether the token is blacklisted
   */
  private static async isTokenBlacklisted(jti: string): Promise<boolean> {
    const blacklistKey = `${this.TOKEN_BLACKLIST_PREFIX}${jti}`;
    const result = await redis.get(blacklistKey);
    return result !== null;
  }

  /**
   * Add a token to the whitelist
   *
   * @param jti - JWT ID
   * @param userId - User ID
   * @param expiresIn - Token expiration time
   */
  private static async whitelistToken(
    jti: string,
    userId: string,
    expiresIn: string
  ): Promise<void> {
    try {
      const whitelistKey = `${this.TOKEN_WHITELIST_PREFIX}${jti}:${userId}`;

      // Convert expiresIn to seconds
      let ttl = 3600; // Default 1 hour

      if (typeof expiresIn === "string") {
        if (expiresIn.endsWith("d")) {
          ttl = parseInt(expiresIn.slice(0, -1), 10) * 24 * 3600;
        } else if (expiresIn.endsWith("h")) {
          ttl = parseInt(expiresIn.slice(0, -1), 10) * 3600;
        } else if (expiresIn.endsWith("m")) {
          ttl = parseInt(expiresIn.slice(0, -1), 10) * 60;
        } else if (expiresIn.endsWith("s")) {
          ttl = parseInt(expiresIn.slice(0, -1), 10);
        }
      }

      await redis.set(whitelistKey, "1", "EX", ttl);
    } catch (error) {
      logger.error("Error whitelisting token:", error);
    }
  }

  /**
   * Check if a token is whitelisted
   *
   * @param jti - JWT ID
   * @returns Whether the token is whitelisted
   */
  private static async isTokenWhitelisted(jti: string): Promise<boolean> {
    const pattern = `${this.TOKEN_WHITELIST_PREFIX}${jti}:*`;
    const keys = await redis.keys(pattern);
    return keys.length > 0;
  }

  /**
   * Decode a token without verification
   *
   * @param token - JWT token
   * @returns Decoded payload or null if invalid
   */
  public static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch (error) {
      logger.error("Error decoding token:", error);
      return null;
    }
  }

  /**
   * Generate a secure token for password reset or email verification
   *
   * @param userId - User ID
   * @param email - User email
   * @param type - Token type
   * @param expiresIn - Token expiration time
   * @returns Generated token
   */
  public static generateSecureToken(
    userId: string,
    email: string,
    type: TokenType.RESET_PASSWORD | TokenType.EMAIL_VERIFICATION,
    expiresIn: string = "1h"
  ): string {
    return this.generateToken(
      {
        userId,
        email,
        type,
      },
      expiresIn
    );
  }
}

export default JwtUtil;

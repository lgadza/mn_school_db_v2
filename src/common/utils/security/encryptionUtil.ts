import crypto from "crypto";
import { promisify } from "util";
import bcrypt from "bcrypt";
import logger from "@/common/utils/logging/logger";
import { appConfig } from "@/config";

/**
 * Encryption algorithm constants
 */
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const HASH_ALGORITHM = "sha256";

/**
 * Hash data interface
 */
export interface HashedData {
  hash: string;
  salt: string;
}

/**
 * Encrypted data interface
 */
export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Encryption Utility
 * Provides standardized methods for encryption, hashing, and data protection
 */
export class EncryptionUtil {
  private static readonly SECRET_KEY = appConfig.security.jwtSecret;
  private static readonly SALT_ROUNDS = 12;

  /**
   * Generate a secure random string
   *
   * @param length - String length
   * @returns Random string
   */
  public static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
  }

  /**
   * Hash a password using bcrypt
   *
   * @param password - Plain text password
   * @param rounds - Salt rounds
   * @returns Hashed password
   */
  public static async hashPassword(
    password: string,
    rounds: number = this.SALT_ROUNDS
  ): Promise<string> {
    try {
      return await bcrypt.hash(password, rounds);
    } catch (error) {
      logger.error("Error hashing password:", error);
      throw new Error("Failed to hash password");
    }
  }

  /**
   * Compare a password with a hash
   *
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns Whether the password matches the hash
   */
  public static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error("Error comparing password:", error);
      throw new Error("Failed to compare password");
    }
  }

  /**
   * Hash data with a salt
   *
   * @param data - Data to hash
   * @param salt - Optional salt (generated if not provided)
   * @returns Hashed data with salt
   */
  public static hashData(data: string, salt?: string): HashedData {
    try {
      const usedSalt = salt || crypto.randomBytes(16).toString("hex");
      const hash = crypto
        .createHmac(HASH_ALGORITHM, usedSalt)
        .update(data)
        .digest("hex");

      return { hash, salt: usedSalt };
    } catch (error) {
      logger.error("Error hashing data:", error);
      throw new Error("Failed to hash data");
    }
  }

  /**
   * Generate a hash for a file
   *
   * @param buffer - File buffer
   * @returns File hash
   */
  public static generateFileHash(buffer: Buffer): string {
    try {
      return crypto.createHash(HASH_ALGORITHM).update(buffer).digest("hex");
    } catch (error) {
      logger.error("Error generating file hash:", error);
      throw new Error("Failed to generate file hash");
    }
  }

  /**
   * Encrypt data
   *
   * @param data - Data to encrypt
   * @param key - Encryption key (uses default if not provided)
   * @returns Encrypted data
   */
  public static encrypt(data: string, key?: string): EncryptedData {
    try {
      const encryptionKey = this.deriveKey(key || this.SECRET_KEY);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        ENCRYPTION_ALGORITHM,
        encryptionKey,
        iv
      );

      let encrypted = cipher.update(data, "utf8", "hex");
      encrypted += cipher.final("hex");
      const authTag = cipher.getAuthTag().toString("hex");

      return {
        encrypted,
        iv: iv.toString("hex"),
        authTag,
      };
    } catch (error) {
      logger.error("Error encrypting data:", error);
      throw new Error("Failed to encrypt data");
    }
  }

  /**
   * Decrypt data
   *
   * @param encryptedData - Encrypted data
   * @param key - Encryption key (uses default if not provided)
   * @returns Decrypted data
   */
  public static decrypt(encryptedData: EncryptedData, key?: string): string {
    try {
      const encryptionKey = this.deriveKey(key || this.SECRET_KEY);
      const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM,
        encryptionKey,
        Buffer.from(encryptedData.iv, "hex")
      );

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, "hex"));

      let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      logger.error("Error decrypting data:", error);
      throw new Error("Failed to decrypt data");
    }
  }

  /**
   * Derive an encryption key from a passphrase
   *
   * @param passphrase - Passphrase
   * @returns Derived key
   */
  private static deriveKey(passphrase: string): Buffer {
    const salt = "staticSalt"; // In production, consider using a proper KMS
    return crypto.scryptSync(passphrase, salt, 32);
  }

  /**
   * Generate a secure token
   *
   * @param length - Token length
   * @returns Secure token
   */
  public static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("base64url");
  }

  /**
   * Create a constant-time comparison function
   * Use this to prevent timing attacks when comparing sensitive strings
   *
   * @param a - First string
   * @param b - Second string
   * @returns Whether the strings are equal
   */
  public static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(a, "utf8"),
      Buffer.from(b, "utf8")
    );
  }

  /**
   * Generate a UUID v4
   *
   * @returns UUID v4
   */
  public static generateUUID(): string {
    return crypto.randomUUID();
  }
}

export default EncryptionUtil;

import nodemailer, { Transporter, TransportOptions } from "nodemailer";
import { readFileSync } from "fs";
import { join } from "path";
import Handlebars from "handlebars";
import logger from "@/common/utils/logging/logger";
import { appConfig } from "@/config";

/**
 * Email attachment interface
 */
export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
  cid?: string;
}

/**
 * Email options interface
 */
export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: EmailAttachment[];
  template?: string;
  context?: Record<string, any>;
}

/**
 * Email status interface
 */
export interface EmailStatus {
  success: boolean;
  messageId?: string;
  error?: Error;
}

/**
 * Email template cache
 */
interface TemplateCache {
  [key: string]: HandlebarsTemplateDelegate;
}

/**
 * Email Utility
 * Provides standardized methods for sending emails
 */
export class EmailUtil {
  private static transporter: Transporter;
  private static templateCache: TemplateCache = {};
  private static templateDir: string;
  private static defaultFrom: string;
  private static initialized = false;

  /**
   * Initialize the email transporter
   */
  public static initialize(): void {
    if (this.initialized) {
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: appConfig.email.smtp.host,
        port: appConfig.email.smtp.port,
        secure: appConfig.email.smtp.secure,
        auth: {
          user: appConfig.email.smtp.auth.user,
          pass: appConfig.email.smtp.auth.pass,
        },
      } as TransportOptions);

      this.defaultFrom = appConfig.email.defaultFrom;
      this.templateDir = join(appConfig.rootDir, "src", "templates", "email");
      this.initialized = true;

      logger.info("Email transporter initialized");
    } catch (error) {
      logger.error("Failed to initialize email transporter:", error);
      throw error;
    }
  }

  /**
   * Send an email
   *
   * @param options - Email options
   * @returns Email status
   */
  public static async sendEmail(options: EmailOptions): Promise<EmailStatus> {
    if (!this.initialized) {
      this.initialize();
    }

    try {
      // If a template is specified, render it
      if (options.template && options.context) {
        const html = await this.renderTemplate(
          options.template,
          options.context
        );
        options.html = html;
      }

      // Ensure we have either text or html content
      if (!options.text && !options.html) {
        throw new Error("Email must have either text or html content");
      }

      const mailOptions = {
        from: options.from || this.defaultFrom,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info("Email sent successfully", {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      logger.error("Failed to send email:", error);

      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Render an email template
   *
   * @param templateName - Template name
   * @param context - Template context
   * @returns Rendered HTML
   */
  private static async renderTemplate(
    templateName: string,
    context: Record<string, any>
  ): Promise<string> {
    try {
      // Try to get compiled template from cache
      if (!this.templateCache[templateName]) {
        const templatePath = join(this.templateDir, `${templateName}.hbs`);
        const source = readFileSync(templatePath, "utf-8");
        this.templateCache[templateName] = Handlebars.compile(source);
      }

      // Render the template with the provided context
      return this.templateCache[templateName](context);
    } catch (error) {
      logger.error(`Failed to render email template '${templateName}':`, error);
      throw error;
    }
  }

  /**
   * Send a welcome email
   *
   * @param email - Recipient email
   * @param name - Recipient name
   * @param verificationLink - Email verification link
   * @param password - Initial password (optional, for admin-created accounts)
   * @returns Email status
   */
  public static async sendWelcomeEmail(
    email: string,
    name: string,
    verificationLink: string | null,
    password?: string
  ): Promise<EmailStatus> {
    return this.sendEmail({
      to: email,
      subject: "Welcome to Our Platform",
      template: "welcome",
      context: {
        name,
        verificationLink,
        password,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Send a password reset email
   *
   * @param email - Recipient email
   * @param name - Recipient name
   * @param resetLink - Password reset link
   * @returns Email status
   */
  public static async sendPasswordResetEmail(
    email: string,
    name: string,
    resetLink: string
  ): Promise<EmailStatus> {
    return this.sendEmail({
      to: email,
      subject: "Password Reset Request",
      template: "password-reset",
      context: {
        name,
        resetLink,
        expiryHours: 1, // Token expires in 1 hour
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Send a password change notification email
   *
   * @param email - Recipient email
   * @param name - Recipient name
   * @returns Email status
   */
  public static async sendPasswordChangeNotification(
    email: string,
    name: string
  ): Promise<EmailStatus> {
    return this.sendEmail({
      to: email,
      subject: "Your Password Has Been Changed",
      template: "password-change",
      context: {
        name,
        timestamp: new Date().toISOString(),
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Send a password reset notification email (when admin resets user password)
   *
   * @param email - Recipient email
   * @param name - Recipient name
   * @param password - New password
   * @returns Email status
   */
  public static async sendPasswordResetNotification(
    email: string,
    name: string,
    password: string
  ): Promise<EmailStatus> {
    return this.sendEmail({
      to: email,
      subject: "Your Password Has Been Reset",
      template: "password-reset-notification",
      context: {
        name,
        password,
        timestamp: new Date().toISOString(),
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Verify the email transporter connection
   *
   * @returns Whether the connection is valid
   */
  public static async verifyConnection(): Promise<boolean> {
    if (!this.initialized) {
      this.initialize();
    }

    try {
      await this.transporter.verify();
      logger.info("Email transporter connection verified");
      return true;
    } catch (error) {
      logger.error("Email transporter connection verification failed:", error);
      return false;
    }
  }
}

export default EmailUtil;

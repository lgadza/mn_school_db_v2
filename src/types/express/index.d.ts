import "express";

declare module "express" {
  export interface Request {
    user?: {
      userId: string;
      username?: string;
      email?: string;
      roles?: string[];
      [key: string]: any;
    };
  }
}

import type { AuthContext } from "../modules/iam/auth/auth-context.type";

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthContext;
    timezone?: string;
  }

  interface Locals {
    auditError?: {
      code: string;
      message: string;
    };
    security?: Record<string, unknown>;
  }
}

export {};

// src/middlewares/rbac.middleware.ts
import { Request, Response, NextFunction } from "express";
import { Role } from "../constants/role.enum";
import { AuthRequest } from "../types/auth.type";
import { ErrorCode } from "../types/error.type";
import { MyResponse } from "../types/response.type";
import { HttpStatus } from "../constants/httpStatus";

/**
 * RBAC Middleware
 * roles: admin, user, viewer
 */
export const rbacMiddleware = (...allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as AuthRequest).user;
        if (!user) {
            return res.status(HttpStatus.UNAUTHORIZED).json(MyResponse.error(ErrorCode.UNAUTHORIZED, "Unauthorized"));
        }
        if (!allowedRoles.includes(user.role)) {
            return res.status(HttpStatus.FORBIDDEN).json(MyResponse.error(ErrorCode.FORBIDDEN, "Forbidden: Insufficient role"));
        }
        next();
    };
};
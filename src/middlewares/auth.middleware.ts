import { NextFunction, Request, Response } from "express";
import { ErrorCode, MyError } from "../types/error.type";
import { AuthRequest, IUserAuth, JwtPayload } from "../types/auth.type";
import { config } from "../config";
import jwt from "jsonwebtoken";
import { Role } from "../constants/role.enum";



export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    /**
     * IMPLEMENT Middleware for AUTH
     */

    if (!req.headers.authorization) throw new MyError({ code: ErrorCode.FORBIDDEN, message: "Missing Authorization Token" });

    const token = req.headers.authorization.split(" ")[1] as string;

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
        (req as AuthRequest).user = decoded.user;
    } catch (err) {
        throw new MyError({ code: ErrorCode.FORBIDDEN, message: "Invalid or expired token" });
    }

    next();
}
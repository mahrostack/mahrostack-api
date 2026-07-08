import { AuthService } from '../../services/auth.service'
import { Request, Response } from 'express'
import { ErrorCode, MyError } from '../../types/error.type';
import { MyResponse } from '../../types/response.type';


const authService = new AuthService();
const validateAuthBody = (body: unknown) => {
    if (!body || typeof body !== "object") {
        throw new MyError({ code: ErrorCode.VALIDATION_ERROR, message: "Invalid payload" });
    }

    const { username, password } = body as Record<string, unknown>;

    if (typeof username !== "string" || username.trim() === "") {
        throw new MyError({ code: ErrorCode.VALIDATION_ERROR, message: "Username is required" });
    }

    if (typeof password !== "string" || password.trim() === "") {
        throw new MyError({ code: ErrorCode.VALIDATION_ERROR, message: "Password is required" });
    }

    return { username: username.trim(), password: password }; // keep password as-is for hashing
};

export class AuthController {

    async login(req: Request, res: Response) {
        const payload = validateAuthBody(req.body);

        const result = await authService.login(payload);

        if (!result) throw new MyError({ code: ErrorCode.INTERNAL_ERROR, message: "Are you hacker?" });

        res.status(200).json(MyResponse.success(result));
    }



    async register(req: Request, res: Response) {
        const payload = validateAuthBody(req.body);

        const result = await authService.register(payload);

        if (!result) throw new MyError({ code: ErrorCode.INTERNAL_ERROR, message: "Are you hacker?" });

        res.status(201).json(MyResponse.success(result));
    }
}
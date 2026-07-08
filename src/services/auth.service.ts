import jwt, { Jwt } from "jsonwebtoken";
import { User } from "../models/user.model";
import { LoginUserDTO, LoginResponse, JwtPayload, RegisterResponse, RegisterUserDTO } from "../types/auth.type";
import { ErrorCode, MyError } from "../types/error.type";
import { config } from '../config'
import { comparePassword, hashPassword } from "../utils/hash";



export class AuthService {
    /**
     * login
     */
    async login(data: LoginUserDTO): Promise<LoginResponse> {
        const exist = await User.findOne({ username: data.username });
        if (!exist) throw new MyError({ code: ErrorCode.UNAUTHORIZED, message: "Are you hacker?" });


        const authorized = await comparePassword(data.password, exist.get("password"))
        if (!authorized) throw new MyError({ code: ErrorCode.UNAUTHORIZED, message: "Are you hacker?" });

        /**
         * check that account is active
         */
        if (!exist.get("active")) {
            throw new MyError({ code: ErrorCode.FORBIDDEN, message: "Account is inactive. Please contact admin." });
        }

        /**
         * Generate JWT Token and auth it
         */
        const payload: JwtPayload = {
            user: {
                _id: exist.get("_id"),
                username: exist.get("username"),
                role: exist.get("role"),
            }

        }
        const token = jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: '1d'
        })



        return {
            _id: exist.get("_id"),
            username: exist.get("username"),
            token: token,
        }
    }


    /**
     * register
     */
    async register(data: RegisterUserDTO): Promise<RegisterResponse> {
        const exist = await User.findOne({ username: data.username });
        if (exist) throw new MyError({ code: ErrorCode.CONFLICT, message: "Username already taken" });


        /**
         * TODO: Hash password before saving
         */
        const newUser = new User({
            username: data.username,
            password: data.password,
        });

        const saved = await newUser.save();

        return {
            _id: saved.id,
            username: saved.username,
            role: saved.role,
            active: saved.active,
        };
    }


}
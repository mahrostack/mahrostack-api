import { Role } from "../constants/role.enum";
import { IUser } from "./user.type";
import { Request } from "express";

/**
 * LoginUserDTO
 */
export interface LoginUserDTO extends Pick<IUser, "username" | "password"> { }



/**
 * LoginResponse
 */
export interface LoginResponse extends Pick<IUser, "_id" | "username"> {
    token: string,
}




/**
 * RegisterUserDTO
 */
export interface RegisterUserDTO extends LoginUserDTO { }



/**
 * RegisterResponse
 */
export interface RegisterResponse {
    _id: string;
    username: string;
    role: Role;
    active: boolean;
}




/**
 * IUserAuth
 */

export interface IUserAuth extends Pick<IUser, "_id" | "username" | "role"> {

}




export interface JwtPayload {
    user: IUserAuth;
    iat?: number;
    exp?: number;
}





export interface AuthRequest<
    Params = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
    user: IUserAuth;
}

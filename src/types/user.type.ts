import { Role } from "../constants/role.enum";

/**
 * IUser
 */
export interface IUser {
    _id: string,
    username: string,
    password: string,
    role: Role,
    active: boolean,
    createdAt?: Date,
    updatedAt?: Date,
}


/**
 * CreateUserDTO
 */
export interface CreateUserDTO extends Pick<IUser, "username" | "password"> { }



/**
 * UpdateUserDTO
 */
export interface UpdateUserDTO extends Partial<Pick<IUser, "username" | "password">> { }




import * as dotenv from 'dotenv';
import path from 'path';
import { HttpStatus } from '../constants/httpStatus';

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

/**
 * check every constant
 * if you have another wise fast way, do it
 */
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length != 32) throw Error("JWT_SECRET is not present!");
if (!process.env.JWT_EXPIRES_IN) throw new Error("JWT_EXPIRES_IN is not present!");
if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === "") throw new Error("MONGO_URI is not present or empty!");



export const MONGO_URI = process.env.MONGO_URI || "";

const PORT = Number(process.env.PORT) || 3030;

export const config = {
    MONGO_URI: MONGO_URI,
    PORT,
    SERVER_ERROR_CODE: HttpStatus.INTERNAL_SERVER_ERROR,
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,


    accounts: {
        IS_NEW_ACCOUNT_ACTIVE: true,
    }
};

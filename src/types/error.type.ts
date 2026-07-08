export enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    NOT_FOUND = "NOT_FOUND",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    CONFLICT = "CONFLICT",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    MISSING_API_KEY = "MISSING_API_KEY",

}

export const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    MISSING_API_KEY: 400,
};


export interface IError {
    code: ErrorCode,
    message: string,
};


export class MyError extends Error implements IError {
    public code: ErrorCode;

    constructor(code: ErrorCode, message: string);
    constructor(error: IError);
    constructor(codeOrError: ErrorCode | IError, message?: string) {
        if (typeof codeOrError === "string") {
            super(message);
            this.code = codeOrError;
        } else {
            super(codeOrError.message);
            this.code = codeOrError.code;
        }
    }
}

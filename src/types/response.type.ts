import { ErrorCode, IError, MyError } from './error.type'


export class MyResponse<T> {
    success: boolean;
    data?: T | null;
    error?: IError | null;

    private constructor(success: boolean, data?: T, error?: IError) {
        this.success = success;
        if (data) this.data = data;
        if (error) this.error = error;
        // this.error = error;
    }

    static success<T>(data: T): MyResponse<T> {
        return new MyResponse<T>(true, data);
    }

    static error(error: IError): MyResponse<null>;
    static error(code: ErrorCode, message: string): MyResponse<null>;
    static error(
        errorOrCode: IError | ErrorCode,
        message?: string
    ): MyResponse<null> {
        if (typeof errorOrCode === "string") {
            return new MyResponse<null>(
                false,
                null,
                new MyError(errorOrCode, message ?? "An error occurred")
            );
        }

        return new MyResponse<null>(false, null, errorOrCode);
    }
}

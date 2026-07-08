    import { NextFunction, Request, Response } from 'express';

    import { config } from '../config'
    import { MyResponse } from '../types/response.type';
    import { IError, MyError } from '../types/error.type';
    import { ERROR_STATUS_MAP, ErrorCode } from "../types/error.type";

    export function mapErrorToHttpStatus(code: ErrorCode): number {
        return ERROR_STATUS_MAP[code] ?? 500;
    }

    export const errorHandler = (err: MyError, req: Request, res: Response, next: NextFunction) => {
        console.log(err);
        if (err instanceof MyError) {
            const status_code = mapErrorToHttpStatus(err.code);

            return res.status(status_code).json(
                MyResponse.error({
                    code: err.code,
                    message: err.message
                }),
            );
        }

        return res.status(config.SERVER_ERROR_CODE).json(
            MyResponse.error(ErrorCode.INTERNAL_ERROR, "Are you hacker?"),
        );
    }


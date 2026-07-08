import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    logger.info("Request received", {
        /**
         * full request details
         */

        ip: req.ip,
        method: req.method,
        
    });
    next();
}

export { loggerMiddleware }

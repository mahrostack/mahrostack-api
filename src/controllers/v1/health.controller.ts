import { Request, Response } from "express"
import { HealthService } from '../../services/health.service'
import { HttpStatus } from "../../constants/httpStatus";
import { MyResponse } from "../../types/response.type";



const healthService = new HealthService();

export class HealthController {
    async getHealth(req: Request, res: Response) {
        const result = await healthService.getHealth();
        res.status(HttpStatus.OK).json(MyResponse.success(result));
    }
}

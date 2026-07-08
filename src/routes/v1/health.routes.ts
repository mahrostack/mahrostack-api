import { Router } from 'express'
import { HealthController } from '../../controllers/v1';


// define router
const router = Router();


/**
 * define an object of health controller
 */
const healthController = new HealthController();



/**
 * GET /
 */
router.get("/", healthController.getHealth.bind(HealthController));




/**
 * export router as it 
 */
export default router;
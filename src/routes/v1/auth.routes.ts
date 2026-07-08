// import * from ''


import { Router } from "express";
import { AuthController } from "../../controllers/v1";


const router = Router();

const authController = new AuthController();

/**
 * POST /login
 */
router.post("/login", authController.login.bind(authController));


/**
 * POST /register
 */
// router.post("/register", authController.register.bind(authController));
export default router;
import { Router } from "express";
import authRoutes from "./auth.routes";


const router = Router();



/**
 * ROUTE /auth
 */
router.use("/auth", authRoutes)





export default router;
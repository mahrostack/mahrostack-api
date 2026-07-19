import { Router } from "express";
import { productsRouter } from "@/modules/products/products.routes";
import { purchasesRouter } from "@/modules/purchases/purchases.routes";
import { salesRouter } from "@/modules/sales/sales.routes";

export const apiRouter = Router();

apiRouter.use("/products", productsRouter);
apiRouter.use("/purchases", purchasesRouter);
apiRouter.use("/sales", salesRouter);

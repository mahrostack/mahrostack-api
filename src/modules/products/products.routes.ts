import { Router } from "express";
import { asyncHandler } from "@/lib/async";
import { paramId } from "@/lib/params";
import * as products from "./products.service";

export const productsRouter = Router();

productsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = typeof req.query["q"] === "string" ? req.query["q"] : undefined;
    const data = await products.listProducts(q);
    res.json({ data });
  }),
);

productsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await products.getProduct(paramId(req.params["id"]));
    res.json({ data });
  }),
);

productsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = await products.createProduct(req.body);
    res.status(201).json({ data });
  }),
);

productsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await products.updateProduct(paramId(req.params["id"]), req.body);
    res.json({ data });
  }),
);

productsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await products.deleteProduct(paramId(req.params["id"]));
    res.status(204).send();
  }),
);

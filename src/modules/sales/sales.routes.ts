import { Router } from "express";
import { asyncHandler } from "@/lib/async";
import { paramId } from "@/lib/params";
import * as sales from "./sales.service";

export const salesRouter = Router();

salesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await sales.listSales();
    res.json({ data });
  }),
);

salesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await sales.getSale(paramId(req.params["id"]));
    res.json({ data });
  }),
);

salesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = await sales.createSale(req.body);
    res.status(201).json({ data });
  }),
);

salesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await sales.deleteSale(paramId(req.params["id"]));
    res.status(204).send();
  }),
);

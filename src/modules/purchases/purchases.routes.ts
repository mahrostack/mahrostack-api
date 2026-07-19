import { Router } from "express";
import { asyncHandler } from "@/lib/async";
import { paramId } from "@/lib/params";
import * as purchases from "./purchases.service";

export const purchasesRouter = Router();

purchasesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const data = await purchases.listPurchases();
    res.json({ data });
  }),
);

purchasesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await purchases.getPurchase(paramId(req.params["id"]));
    res.json({ data });
  }),
);

purchasesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = await purchases.createPurchase(req.body);
    res.status(201).json({ data });
  }),
);

purchasesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await purchases.deletePurchase(paramId(req.params["id"]));
    res.status(204).send();
  }),
);

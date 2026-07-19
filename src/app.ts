/**
 * @file app.ts
 * @description Main application file
 * @author Mahros AL-Qabasy <mahros.dev>
 */

import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import { apiRouter } from "@/routes";
import { AppError } from "@/lib/errors";

export const createApp = (): Application => {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", apiRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.status).json({
        error: { code: err.code, message: err.message },
      });
      return;
    }

    console.error(err);
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
    });
  });

  return app;
};

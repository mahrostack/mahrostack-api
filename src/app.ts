/**
 * @file app.ts
 * @description Main application file
 * @author Mahros AL-Qabasy <mahros.dev>
 */


import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import hpp from "hpp";


export const createApp = (): Application => {
  const app = express();





  // const corsOptions: CorsOptions = 
  // app.use(cors(corsOptions));
  // app.options(/.*/, cors(corsOptions));



  /**
   * hadle proxy trust
   */
  app.set("trust proxy", 1);






  /**
   * health, helthz
   */
  app.get("/health", (req, res) => {
    res.status(200).json({ json: "ok" });
  });



  // app.use("/api/v1", v1Routes);


  return app;
};

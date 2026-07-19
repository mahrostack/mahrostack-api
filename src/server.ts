import "dotenv/config";
import http from "http";
import { createApp } from "./app";

let httpServer: http.Server | null = null;

const startServer = async () => {
  try {
    const app = createApp();
    const server = http.createServer(app);
    httpServer = server;

    const port = Number(process.env["PORT"] ?? 3030);

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${port} is already in use. Set PORT in .env or stop the process using it.`,
        );
      } else {
        console.error("Server error", { message: err.message, stack: err.stack });
      }
      process.exit(1);
    });

    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();

export { httpServer };



import http from 'http';
import { createApp } from "./app";

let httpServer: http.Server | null = null;


/**
 * server bootstrap
 */
const startServer = async () => {
    try {
        const app = createApp();
        const server = http.createServer(app);


        // Large backup uploads (multipart or chunked) may run for many minutes.
        server.requestTimeout = 0;
        server.headersTimeout = 0;
        httpServer = server;
        const port = 3030;


        server.on("error", async (err: any) => {
            if (err?.code === "EADDRINUSE") {
                console.error(
                    `Port ${port} is already in use. Set PORT in .env (e.g. PORT=3031) or stop the process using it.`
                );


            } else {
                console.error("Server error", { message: err?.message, stack: err?.stack });
            }

        });

        /**
         * start listening
         */
        server.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);

        });
    } catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
}


startServer();

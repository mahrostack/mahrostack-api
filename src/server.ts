import { config } from './config';
import { createApp } from "./app";
import { connectDB } from "./config/database";



/**
 * server bootstrap
 */
const startServer = async () => {
    try {
        /**
         * init mongodb connection
         */
        await connectDB();

        /**
         * create express app
         */
        const app = createApp();

        /**
         * start listening
         */
        app.listen(config.PORT, () => {
            console.log(`Server is running at http://localhost:${config.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
}


startServer();

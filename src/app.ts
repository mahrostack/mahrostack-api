import express, { Application } from 'express';
import cors, { CorsOptions } from 'cors';


/**
 * routes
 */
import v1Routes from './routes/v1'
import healthRoutes from './routes/v1/health.routes'

/**
 * middlewares
 */
import { errorHandler } from './middlewares/error.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware'


export const createApp = (): Application => {
    const app = express();


    /**
     * handle cors
     * 
     */
    const allowedDomains: string[] = [
        'localhost',
        'localhost:3030',
        '127.0.0.1',
        'alqabasy.online',
    ];

    const createCorsOptions = (): CorsOptions => ({
        origin: (origin: string | undefined, callback) => {
            if (!origin) {
                return callback(null, true);
            }

            let hostname: string;

            try {
                hostname = new URL(origin).hostname;
            } catch {
                return callback(new Error('Invalid origin'));
            }

            const isAllowed = allowedDomains.some((domain: string) => {
                return hostname === domain || hostname.endsWith(`.${domain}`);
            });

            if (isAllowed) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    const corsOptions: CorsOptions = createCorsOptions();
    app.use(cors(corsOptions));



    /**
     * parse request json
     */
    app.use(express.json());



    /**
     * hadle proxy trust
     */
    app.set('trust proxy', 1);




    /**
     * logger middleware
     */
    app.use(loggerMiddleware);



    /**
     * GET /
     */
    app.get("/", (req, res) => {
        res.send("Hello, <del>World</del> Hackers!")
    })

    /**
     * ROUTE /halth
     */
    app.use("/health", healthRoutes)



    /**
     * ROUTE /api/v1
     */
    app.use("/api/v1", v1Routes)

    /**
     * Error handling middleware
     */
    app.use(errorHandler);

    return app;
}

import mongoose, { mongo } from 'mongoose';






const getDBStatus = (): string => {
    /**
     *  // Check current connection status
        const connectionStatus = mongoose.connection.readyState;
        // readyState values:
        // 0 = disconnected
        // 1 = connected
        // 2 = connecting
        // 3 = disconnecting
     */
    const status = mongoose.connection.readyState;
    switch (status) {
        case 0:
            return "disconnected";
        case 1:
            return "connected";
        case 2:
            return "connecting";
        case 3:
            return "disconnecting";
    }
    return "unknown";
}

export class HealthService {
    async getHealth() {
        return {
            api: {
                healthy: true,

            },
            database: {
                healthy: getDBStatus(),
            },
            timestamp: new Date().toISOString(),
        };
    }

}
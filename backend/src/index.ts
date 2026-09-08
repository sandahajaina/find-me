import dotenv from 'dotenv';
import app from './app';
import { Server } from "socket.io"
import { createServer } from 'node:http';
import { connectDB } from './config/db';
import { initSocket } from './socket/socket';

dotenv.config();

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await connectDB();

        const httpServer = createServer(app)

        const io = new Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL,
                credentials: true
            }
        });

        initSocket(io)

        httpServer.listen(PORT, () =>{
            console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
})();

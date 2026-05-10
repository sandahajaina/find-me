import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await connectDB();

        app.listen(PORT, () =>{
            console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
})();
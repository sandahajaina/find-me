import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

// Chargement des variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Route de santé
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Charger les variables d'environnement depuis .env
dotenv.config();

// Importer les routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

// Initialiser l'application Express
const app = express();

// Middlewares globaux

// Activer CORS (supporte le frontend local et le frontend déployé sur Vercel)
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

// Parser le JSON dans le body des requêtes
app.use(express.json());

// Routes

// Route de test pour vérifier que le serveur fonctionne
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Bienvenue sur l'API TaskFlow !",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      taches: "/api/taches",
    },
  });
});

// Routes d'authentification (inscription, connexion, profil)
app.use("/api/auth", authRoutes);

// Routes des tâches (CRUD)
app.use("/api/taches", taskRoutes);

// Gestion des routes inexistantes (404)

app.use((req, res) => {
  res.status(404).json({ message: "Route introuvable." });
});

// Connexion à MongoDB et démarrage du serveur

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB avec succès !");
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Erreur de connexion à MongoDB :", error.message);
    process.exit(1);
  });

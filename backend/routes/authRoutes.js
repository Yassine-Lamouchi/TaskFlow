const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Fonction utilitaire : générer un token JWT

const genererToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Le token expire dans 7 jours
  });
};

// POST /api/auth/inscription — Créer un nouveau compte

router.post("/inscription", async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;

    // 1. Vérifier que tous les champs sont remplis
    if (!nom || !email || !motDePasse) {
      return res.status(400).json({
        message: "Veuillez remplir tous les champs (nom, email, motDePasse).",
      });
    }

    // 2. Vérifier si l'email existe déjà
    const utilisateurExiste = await User.findOne({ email });
    if (utilisateurExiste) {
      return res.status(400).json({
        message: "Un compte avec cet email existe déjà.",
      });
    }

    // 3. Créer l'utilisateur (le mot de passe est haché automatiquement via le pre-save)
    const utilisateur = await User.create({ nom, email, motDePasse });

    // 4. Générer le token et renvoyer la réponse
    const token = genererToken(utilisateur._id);

    res.status(201).json({
      message: "Compte créé avec succès !",
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
      },
      token,
    });
  } catch (error) {
    // Erreurs de validation Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

// POST /api/auth/connexion — Se connecter à un compte existant

router.post("/connexion", async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // 1. Vérifier que les champs sont remplis
    if (!email || !motDePasse) {
      return res.status(400).json({
        message: "Veuillez fournir l'email et le mot de passe.",
      });
    }

    // 2. Chercher l'utilisateur par email
    const utilisateur = await User.findOne({ email });
    if (!utilisateur) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect.",
      });
    }

    // 3. Vérifier le mot de passe
    const motDePasseValide = await utilisateur.compareMotDePasse(motDePasse);
    if (!motDePasseValide) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect.",
      });
    }

    // 4. Générer le token et renvoyer la réponse
    const token = genererToken(utilisateur._id);

    res.json({
      message: "Connexion réussie !",
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        email: utilisateur.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

// GET /api/auth/profil — Récupérer le profil de l'utilisateur connecté

router.get("/profil", authMiddleware, async (req, res) => {
  res.json({
    utilisateur: {
      id: req.user._id,
      nom: req.user.nom,
      email: req.user.email,
    },
  });
});

module.exports = router;

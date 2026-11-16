const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware d'authentification
// Vérifie que la requête contient un token JWT valide
// et attache l'utilisateur à req.user

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Accès refusé. Aucun token fourni.",
      });
    }

    // 2. Extraire le token (format: "Bearer <token>")
    const token = authHeader.split(" ")[1];

    // 3. Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Trouver l'utilisateur en base (sans le mot de passe)
    const user = await User.findById(decoded.id).select("-motDePasse");

    if (!user) {
      return res.status(401).json({
        message: "Token invalide. Utilisateur introuvable.",
      });
    }

    // 5. Attacher l'utilisateur à la requête
    req.user = user;

    // 6. Passer au middleware/route suivant
    next();
  } catch (error) {
    // Token expiré ou invalide
    return res.status(401).json({
      message: "Token invalide ou expiré.",
    });
  }
};

module.exports = authMiddleware;

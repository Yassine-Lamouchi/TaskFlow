const express = require("express");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Toutes les routes ci-dessous nécessitent une authentification
router.use(authMiddleware);

// GET /api/taches — Récupérer toutes les tâches de l'utilisateur

router.get("/", async (req, res) => {
  try {
    // Filtres optionnels via query params : ?statut=en_cours&priorite=haute
    const filtres = { userId: req.user._id };

    if (req.query.statut) {
      filtres.statut = req.query.statut;
    }
    if (req.query.priorite) {
      filtres.priorite = req.query.priorite;
    }

    const taches = await Task.find(filtres).sort({ createdAt: -1 });

    res.json({
      count: taches.length,
      taches,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

// GET /api/taches/stats — Statistiques des tâches de l'utilisateur

router.get("/stats", async (req, res) => {
  try {
    const userId = req.user._id;

    const total = await Task.countDocuments({ userId });
    const aFaire = await Task.countDocuments({ userId, statut: "a_faire" });
    const enCours = await Task.countDocuments({ userId, statut: "en_cours" });
    const termine = await Task.countDocuments({ userId, statut: "termine" });

    const pourcentageTermine =
      total > 0 ? Math.round((termine / total) * 100) : 0;

    res.json({
      total,
      parStatut: {
        a_faire: aFaire,
        en_cours: enCours,
        termine,
      },
      pourcentageTermine,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

// GET /api/taches/:id — Récupérer une tâche par son ID

router.get("/:id", async (req, res) => {
  try {
    const tache = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id, // Sécurité : seulement les tâches de l'utilisateur
    });

    if (!tache) {
      return res.status(404).json({ message: "Tâche introuvable." });
    }

    res.json({ tache });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

// POST /api/taches — Créer une nouvelle tâche

router.post("/", async (req, res) => {
  try {
    const { titre, description, statut, priorite, dateLimite } = req.body;

    // Vérifier que le titre est fourni
    if (!titre) {
      return res.status(400).json({ message: "Le titre est obligatoire." });
    }

    const tache = await Task.create({
      titre,
      description: description || "",
      statut: statut || "a_faire",
      priorite: priorite || "moyenne",
      dateLimite: dateLimite || null,
      userId: req.user._id,
    });

    res.status(201).json({
      message: "Tâche créée avec succès !",
      tache,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

// PUT /api/taches/:id — Modifier une tâche existante

router.put("/:id", async (req, res) => {
  try {
    const { titre, description, statut, priorite, dateLimite } = req.body;

    // Trouver la tâche (seulement si elle appartient à l'utilisateur)
    const tache = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!tache) {
      return res.status(404).json({ message: "Tâche introuvable." });
    }

    // Mettre à jour uniquement les champs fournis
    if (titre !== undefined) tache.titre = titre;
    if (description !== undefined) tache.description = description;
    if (statut !== undefined) tache.statut = statut;
    if (priorite !== undefined) tache.priorite = priorite;
    if (dateLimite !== undefined) tache.dateLimite = dateLimite;

    await tache.save();

    res.json({
      message: "Tâche mise à jour avec succès !",
      tache,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

// DELETE /api/taches/:id — Supprimer une tâche

router.delete("/:id", async (req, res) => {
  try {
    const tache = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // Sécurité : seulement les tâches de l'utilisateur
    });

    if (!tache) {
      return res.status(404).json({ message: "Tâche introuvable." });
    }

    res.json({ message: "Tâche supprimée avec succès !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

module.exports = router;

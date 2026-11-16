const mongoose = require("mongoose");

// Modèle Task — Représente une tâche dans le tableau Kanban

const taskSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, "Le titre est obligatoire"],
      trim: true,
      maxlength: [100, "Le titre ne peut pas dépasser 100 caractères"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
      default: "",
    },
    statut: {
      type: String,
      enum: {
        values: ["a_faire", "en_cours", "termine"],
        message: "Le statut doit être : a_faire, en_cours ou termine",
      },
      default: "a_faire",
    },
    priorite: {
      type: String,
      enum: {
        values: ["basse", "moyenne", "haute"],
        message: "La priorité doit être : basse, moyenne ou haute",
      },
      default: "moyenne",
    },
    dateLimite: {
      type: Date,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'utilisateur est obligatoire"],
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  },
);

module.exports = mongoose.model("Task", taskSchema);

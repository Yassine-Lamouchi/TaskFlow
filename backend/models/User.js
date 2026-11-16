const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Modèle User — Représente un utilisateur inscrit

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
      minlength: [2, "Le nom doit contenir au moins 2 caractères"],
      maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"],
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Veuillez fournir un email valide",
      ],
    },
    motDePasse: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  },
);

// Middleware "pre-save" : hache le mot de passe avant de
// sauvegarder l'utilisateur dans la base de données.

userSchema.pre("save", async function (next) {
  // Ne hache que si le mot de passe a été modifié (ou est nouveau)
  if (!this.isModified("motDePasse")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

// Méthode d'instance : compare un mot de passe en clair
// avec le mot de passe haché stocké en base.

userSchema.methods.compareMotDePasse = async function (motDePasseSaisi) {
  return await bcrypt.compare(motDePasseSaisi, this.motDePasse);
};

module.exports = mongoose.model("User", userSchema);

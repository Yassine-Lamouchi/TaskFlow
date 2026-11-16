import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import api from "../api";

// AuthPage — Page de Connexion / Inscription
// Un seul composant avec 2 onglets pour basculer entre les modes

const AuthPage = ({ theme, basculerTheme }) => {
  const navigate = useNavigate();

  // Mode actif : "connexion" ou "inscription"
  const [mode, setMode] = useState("connexion");

  // Champs du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    motDePasse: "",
  });

  // États de l'UI
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [chargement, setChargement] = useState(false);

  // Gérer les changements dans les inputs

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErreur(""); // Effacer l'erreur quand l'utilisateur tape
  };

  // Basculer entre Connexion et Inscription

  const changerMode = (nouveauMode) => {
    setMode(nouveauMode);
    setErreur("");
    setSucces("");
    setFormData({ nom: "", email: "", motDePasse: "" });
  };

  // Soumettre le formulaire

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setChargement(true);

    try {
      if (mode === "inscription") {
        // INSCRIPTION
        const response = await api.post("/auth/inscription", {
          nom: formData.nom,
          email: formData.email,
          motDePasse: formData.motDePasse,
        });

        // Stocker le token et les infos utilisateur
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "utilisateur",
          JSON.stringify(response.data.utilisateur),
        );

        setSucces("Compte créé avec succès ! Redirection...");

        // Rediriger vers le dashboard après 1 seconde
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        // CONNEXION
        const response = await api.post("/auth/connexion", {
          email: formData.email,
          motDePasse: formData.motDePasse,
        });

        // Stocker le token et les infos utilisateur
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "utilisateur",
          JSON.stringify(response.data.utilisateur),
        );

        setSucces("Connexion réussie ! Redirection...");

        // Rediriger vers le dashboard après 1 seconde
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error) {
      // Afficher le message d'erreur du serveur
      const message =
        error.response?.data?.message ||
        "Une erreur est survenue. Vérifie ta connexion.";
      setErreur(message);
    } finally {
      setChargement(false);
    }
  };

  // Rendu du composant

  return (
    <div className="auth-container">
      {/* Bouton Dark Mode discret en haut à droite */}
      <button
        className="auth-theme-toggle"
        onClick={basculerTheme}
        title={theme === "light" ? "Mode sombre" : "Mode clair"}
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <h1>
            <CheckSquare size={32} />
            TaskFlow
          </h1>
          <p>Gérez vos tâches efficacement</p>
        </div>

        {/* Onglets Connexion / Inscription */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "connexion" ? "active" : ""}`}
            onClick={() => changerMode("connexion")}
          >
            <LogIn
              size={16}
              style={{ marginRight: 6, verticalAlign: "middle" }}
            />
            Connexion
          </button>
          <button
            className={`auth-tab ${mode === "inscription" ? "active" : ""}`}
            onClick={() => changerMode("inscription")}
          >
            <UserPlus
              size={16}
              style={{ marginRight: 6, verticalAlign: "middle" }}
            />
            Inscription
          </button>
        </div>

        {/* Message d'erreur */}
        {erreur && (
          <div className="auth-error" style={{ marginBottom: 18 }}>
            <AlertCircle size={16} />
            {erreur}
          </div>
        )}

        {/* Message de succès */}
        {succes && (
          <div className="auth-success" style={{ marginBottom: 18 }}>
            <CheckCircle size={16} />
            {succes}
          </div>
        )}

        {/* Formulaire */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Champ Nom (inscription uniquement) */}
          {mode === "inscription" && (
            <div className="form-group">
              <label htmlFor="nom">Nom complet</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  placeholder="Yassine Lamouchi"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {/* Champ Email */}
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="exemple@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="form-group">
            <label htmlFor="motDePasse">Mot de passe</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="motDePasse"
                name="motDePasse"
                placeholder="Au moins 6 caractères"
                value={formData.motDePasse}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={chargement}
            style={{ marginTop: 4 }}
          >
            {chargement ? (
              <>
                <Loader2 size={18} className="spin" />
                Chargement...
              </>
            ) : mode === "connexion" ? (
              <>
                <LogIn size={18} />
                Se connecter
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Créer un compte
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;

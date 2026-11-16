import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import api from "../api";

// TaskModal — Modal pour créer ou modifier une tâche
// Props :
//   - tache     : objet tâche existante (null = création)
//   - onFermer  : callback pour fermer le modal
//   - onSauvegarde : callback après création/modification réussie

const TaskModal = ({ tache, onFermer, onSauvegarde }) => {
  const estModification = tache !== null;

  // Champs du formulaire
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    statut: "a_faire",
    priorite: "moyenne",
    dateLimite: "",
  });

  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  // Pré-remplir le formulaire en mode modification

  useEffect(() => {
    if (tache) {
      setFormData({
        titre: tache.titre || "",
        description: tache.description || "",
        statut: tache.statut || "a_faire",
        priorite: tache.priorite || "moyenne",
        dateLimite: tache.dateLimite ? tache.dateLimite.substring(0, 10) : "",
      });
    }
  }, [tache]);

  // Gérer les changements dans les inputs

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErreur("");
  };

  // Soumettre le formulaire

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");

    // Validation
    if (!formData.titre.trim()) {
      setErreur("Le titre est obligatoire.");
      return;
    }

    setChargement(true);

    try {
      const donnees = {
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        statut: formData.statut,
        priorite: formData.priorite,
        dateLimite: formData.dateLimite || null,
      };

      if (estModification) {
        // Modifier la tâche existante
        await api.put(`/taches/${tache._id}`, donnees);
      } else {
        // Créer une nouvelle tâche
        await api.post("/taches", donnees);
      }

      onSauvegarde();
    } catch (error) {
      const message =
        error.response?.data?.message || "Une erreur est survenue.";
      setErreur(message);
    } finally {
      setChargement(false);
    }
  };

  // Fermer le modal en cliquant sur l'overlay

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onFermer();
    }
  };

  // Rendu

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card">
        {/* En-tête du modal */}
        <div className="modal-header">
          <h2>{estModification ? "Modifier la tâche" : "Nouvelle tâche"}</h2>
          <button className="btn-icon" onClick={onFermer}>
            <X size={20} />
          </button>
        </div>

        {/* Message d'erreur */}
        {erreur && <div className="auth-error">{erreur}</div>}

        {/* Formulaire */}
        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Titre */}
          <div className="form-group">
            <label htmlFor="titre">
              Titre <span className="required">*</span>
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              placeholder="Ex: Préparer la présentation"
              value={formData.titre}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Détails de la tâche (optionnel)"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Ligne : Statut + Priorité */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="statut">Statut</label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
              >
                <option value="a_faire">📋 À faire</option>
                <option value="en_cours">⚡ En cours</option>
                <option value="termine">✅ Terminé</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priorite">Priorité</label>
              <select
                id="priorite"
                name="priorite"
                value={formData.priorite}
                onChange={handleChange}
              >
                <option value="basse">🟢 Basse</option>
                <option value="moyenne">🟠 Moyenne</option>
                <option value="haute">🔴 Haute</option>
              </select>
            </div>
          </div>

          {/* Date limite */}
          <div className="form-group">
            <label htmlFor="dateLimite">Date limite</label>
            <input
              type="date"
              id="dateLimite"
              name="dateLimite"
              value={formData.dateLimite}
              onChange={handleChange}
            />
          </div>

          {/* Boutons */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onFermer}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={chargement}
            >
              {chargement ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {estModification ? "Enregistrer" : "Créer la tâche"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

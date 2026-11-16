import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  LogOut,
  Plus,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Filter,
  Clock,
  ArrowRight,
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  AlertTriangle,
  Sun,
  Moon,
} from "lucide-react";
import api from "../api";
import TaskModal from "../components/TaskModal";
import "../App.css";

// Constantes

const COLONNES = [
  { id: "a_faire", titre: "À faire", icone: "📋", couleur: "#3b82f6" },
  { id: "en_cours", titre: "En cours", icone: "⚡", couleur: "#f59e0b" },
  { id: "termine", titre: "Terminé", icone: "✅", couleur: "#22c55e" },
];

const PRIORITES = [
  { valeur: "", label: "Toutes" },
  { valeur: "haute", label: "Haute" },
  { valeur: "moyenne", label: "Moyenne" },
  { valeur: "basse", label: "Basse" },
];

// Dashboard — Page principale avec le tableau Kanban

const Dashboard = ({ theme, basculerTheme }) => {
  const navigate = useNavigate();

  // Récupérer l'utilisateur connecté
  const utilisateur = JSON.parse(
    localStorage.getItem("utilisateur") || '{"nom":"Utilisateur"}',
  );

  // États
  const [taches, setTaches] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    parStatut: { a_faire: 0, en_cours: 0, termine: 0 },
    pourcentageTermine: 0,
  });
  const [filtrePriorite, setFiltrePriorite] = useState("");
  const [modalOuvert, setModalOuvert] = useState(false);
  const [tacheAModifier, setTacheAModifier] = useState(null);
  const [chargement, setChargement] = useState(true);

  // Charger les tâches depuis l'API

  const chargerTaches = useCallback(async () => {
    try {
      const params = {};
      if (filtrePriorite) params.priorite = filtrePriorite;

      const response = await api.get("/taches", { params });
      setTaches(response.data.taches);
    } catch (error) {
      console.error("Erreur chargement tâches :", error);
    }
  }, [filtrePriorite]);

  // Charger les statistiques depuis l'API

  const chargerStats = async () => {
    try {
      const response = await api.get("/taches/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Erreur chargement stats :", error);
    }
  };

  // Charger les données au montage et quand le filtre change

  useEffect(() => {
    const charger = async () => {
      setChargement(true);
      await Promise.all([chargerTaches(), chargerStats()]);
      setChargement(false);
    };
    charger();
  }, [chargerTaches]);

  // Déconnexion

  const deconnexion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
    navigate("/");
  };

  // Changer le statut d'une tâche (déplacer entre colonnes)

  const changerStatut = async (tacheId, nouveauStatut) => {
    try {
      await api.put(`/taches/${tacheId}`, { statut: nouveauStatut });
      await Promise.all([chargerTaches(), chargerStats()]);
    } catch (error) {
      console.error("Erreur changement statut :", error);
    }
  };

  // Supprimer une tâche

  const supprimerTache = async (tacheId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      return;
    }
    try {
      await api.delete(`/taches/${tacheId}`);
      await Promise.all([chargerTaches(), chargerStats()]);
    } catch (error) {
      console.error("Erreur suppression :", error);
    }
  };

  // Ouvrir le modal pour créer ou modifier

  const ouvrirModalCreation = () => {
    setTacheAModifier(null);
    setModalOuvert(true);
  };

  const ouvrirModalModification = (tache) => {
    setTacheAModifier(tache);
    setModalOuvert(true);
  };

  const fermerModal = () => {
    setModalOuvert(false);
    setTacheAModifier(null);
  };

  // Callback après sauvegarde dans le modal
  const onTacheSauvegardee = async () => {
    fermerModal();
    await Promise.all([chargerTaches(), chargerStats()]);
  };

  // Filtrer les tâches par colonne

  const tachesParColonne = (statutColonne) => {
    return taches.filter((t) => t.statut === statutColonne);
  };

  // Formater une date

  const formaterDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  // Vérifier si une date est dépassée
  const estEnRetard = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  // Rendu

  return (
    <div className="dashboard">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-brand">
          <CheckSquare size={24} />
          <span className="navbar-title">TaskFlow</span>
        </div>
        <div className="navbar-user">
          <span className="navbar-username">Bonjour, {utilisateur.nom}</span>
          <button
            className="btn-theme-toggle"
            onClick={basculerTheme}
            title={theme === "light" ? "Mode sombre" : "Mode clair"}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="btn btn-logout" onClick={deconnexion}>
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        {/* STATISTIQUES */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon stat-icon-total">
              <ClipboardList size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total des tâches</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-done">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.parStatut.termine}</span>
              <span className="stat-label">Tâches terminées</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-percent">
              <TrendingUp size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.pourcentageTermine}%</span>
              <span className="stat-label">Complétion</span>
            </div>
          </div>
        </div>

        {/* FILTRES + BOUTON AJOUTER */}
        <div className="toolbar">
          <div className="filters">
            <Filter size={16} className="filter-icon" />
            {PRIORITES.map((p) => (
              <button
                key={p.valeur}
                className={`filter-btn ${
                  filtrePriorite === p.valeur ? "active" : ""
                }`}
                onClick={() => setFiltrePriorite(p.valeur)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={ouvrirModalCreation}>
            <Plus size={18} />
            Nouvelle tâche
          </button>
        </div>

        {/* TABLEAU KANBAN */}
        {chargement ? (
          <div className="loading-state">Chargement...</div>
        ) : (
          <div className="kanban-board">
            {COLONNES.map((colonne) => {
              const tachesColonne = tachesParColonne(colonne.id);
              return (
                <div className="kanban-colonne" key={colonne.id}>
                  {/* En-tête de colonne */}
                  <div
                    className="colonne-header"
                    style={{ borderTopColor: colonne.couleur }}
                  >
                    <span className="colonne-icone">{colonne.icone}</span>
                    <span className="colonne-titre">{colonne.titre}</span>
                    <span className="colonne-count">
                      {tachesColonne.length}
                    </span>
                  </div>

                  {/* Liste de cartes */}
                  <div className="colonne-body">
                    {tachesColonne.length === 0 ? (
                      <div className="colonne-vide">Aucune tâche</div>
                    ) : (
                      tachesColonne.map((tache) => (
                        <div className="task-card" key={tache._id}>
                          {/* Badge priorité */}
                          <span
                            className={`badge-priorite badge-${tache.priorite}`}
                          >
                            {tache.priorite}
                          </span>

                          {/* Titre */}
                          <h4 className="task-titre">{tache.titre}</h4>

                          {/* Description */}
                          {tache.description && (
                            <p className="task-description">
                              {tache.description}
                            </p>
                          )}

                          {/* Date limite */}
                          {tache.dateLimite && (
                            <div
                              className={`task-date ${
                                estEnRetard(tache.dateLimite) &&
                                tache.statut !== "termine"
                                  ? "en-retard"
                                  : ""
                              }`}
                            >
                              {estEnRetard(tache.dateLimite) &&
                              tache.statut !== "termine" ? (
                                <AlertTriangle size={13} />
                              ) : (
                                <Calendar size={13} />
                              )}
                              {formaterDate(tache.dateLimite)}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="task-actions">
                            {/* Boutons de déplacement */}
                            <div className="task-move">
                              {colonne.id !== "a_faire" && (
                                <button
                                  className="btn-icon"
                                  title="Déplacer à gauche"
                                  onClick={() =>
                                    changerStatut(
                                      tache._id,
                                      colonne.id === "termine"
                                        ? "en_cours"
                                        : "a_faire",
                                    )
                                  }
                                >
                                  <ArrowLeft size={14} />
                                </button>
                              )}
                              {colonne.id !== "termine" && (
                                <button
                                  className="btn-icon"
                                  title="Déplacer à droite"
                                  onClick={() =>
                                    changerStatut(
                                      tache._id,
                                      colonne.id === "a_faire"
                                        ? "en_cours"
                                        : "termine",
                                    )
                                  }
                                >
                                  <ArrowRight size={14} />
                                </button>
                              )}
                            </div>

                            {/* Modifier / Supprimer */}
                            <div className="task-edit-del">
                              <button
                                className="btn-icon btn-edit"
                                title="Modifier"
                                onClick={() => ouvrirModalModification(tache)}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                className="btn-icon btn-delete"
                                title="Supprimer"
                                onClick={() => supprimerTache(tache._id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODA */}
      {modalOuvert && (
        <TaskModal
          tache={tacheAModifier}
          onFermer={fermerModal}
          onSauvegarde={onTacheSauvegardee}
        />
      )}
    </div>
  );
};

export default Dashboard;

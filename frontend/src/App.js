import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// App — Composant principal de routage + gestion du Dark Mode

function App() {
  const token = localStorage.getItem("token");

  // Dark Mode : lire le thème sauvegardé dans localStorage
  // (par défaut "light" si rien n'est sauvegardé)

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Appliquer l'attribut data-theme sur <html> à chaque changement
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fonction pour basculer entre light et dark
  const basculerTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Routes>
      {/* Page d'authentification (connexion / inscription) */}
      <Route
        path="/"
        element={
          // Si déjà connecté, rediriger vers le dashboard
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage theme={theme} basculerTheme={basculerTheme} />
          )
        }
      />

      {/* Dashboard protégé (nécessite un token) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard theme={theme} basculerTheme={basculerTheme} />
          </ProtectedRoute>
        }
      />

      {/* Toute autre route → rediriger vers l'accueil */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

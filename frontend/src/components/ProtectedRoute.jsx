import React from "react";
import { Navigate } from "react-router-dom";

// ProtectedRoute — Empêche l'accès au dashboard si l'utilisateur
// n'est pas connecté. Redirige vers la page d'authentification.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // Si pas de token → rediriger vers la page de connexion
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si connecté → afficher la page demandée
  return children;
};

export default ProtectedRoute;

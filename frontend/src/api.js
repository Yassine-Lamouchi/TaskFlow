import axios from "axios";

// Configuration d'Axios — Instance préconfigurée pour l'API

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur de requête :
// Ajoute automatiquement le token JWT à chaque requête
// si l'utilisateur est connecté (token dans localStorage).

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Intercepteur de réponse :
// Si le serveur renvoie 401 (non autorisé), ça veut dire
// que le token est expiré → on déconnecte l'utilisateur.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("utilisateur");
      // Rediriger vers la page de connexion
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;

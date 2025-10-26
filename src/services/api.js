import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const auth = {
  loginEleve: (nom, prenom) => api.post('/login/eleve/', { nom, prenom }),
  loginEnseignant: (password) => api.post('/login/enseignant/', { password }),
};

export const eleves = {
  getAll: (params) => api.get('/eleves/', { params }),
  create: (data) => api.post('/eleves/', data),
  update: (id, data) => api.put(`/eleves/${id}/`, data),
  delete: (id) => api.delete(`/eleves/${id}/`),
};

export const fichiers = {
  getForEleve: (eleveId) => api.get(`/eleve/${eleveId}/fichiers/`),
  getAll: () => api.get('/fichiers/'),
  create: (data) => api.post('/fichiers/', data),
  delete: (id) => api.delete(`/fichiers/${id}/`),
};

export const activites = {
  getForEleve: (eleveId) => api.get(`/eleve/${eleveId}/activites/`),
  getAll: () => api.get('/activites/'),
  create: (data) => api.post('/activites/', data),
  completer: (eleveId, activiteId) => api.post('/completer-activite/', {
    eleve_id: eleveId,
    activite_id: activiteId
  }),
};

export const exercices = {
  getForEleve: (eleveId) => api.get(`/eleve/${eleveId}/exercices/`),
  getAll: () => api.get('/exercices/'),
  create: (data) => api.post('/exercices/', data),
  soumettreReponse: (eleveId, exerciceId, reponse) => api.post('/soumettre-reponse/', {
    eleve_id: eleveId,
    exercice_id: exerciceId,
    reponse: reponse
  }),
};

export const notes = {
  getForEleve: (eleveId) => api.get(`/eleve/${eleveId}/note/`),
};

export const messages = {
  getForEleve: (eleveId) => api.get(`/eleve/${eleveId}/messages/`),
  envoyer: (data) => api.post('/envoyer-message/', data),
  getAll: () => api.get('/messages/'),
};

export default api;

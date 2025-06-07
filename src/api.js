// --- START OF FILE app/frontend/src/api.js ---
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Authentification ---
export const loginEleve = (credentials) => apiClient.post('/login/eleve/', credentials);
export const loginTeacher = (credentials) => apiClient.post('/login/enseignant/', credentials);

// --- Eleves (pour Enseignant) ---
export const getEleves = (params) => apiClient.get('/eleves/', { params }); // params: { classe, search }
export const createEleve = (data) => apiClient.post('/eleves/', data);
export const updateEleve = (id, data) => apiClient.put(`/eleves/${id}/`, data);
export const deleteEleve = (id) => apiClient.delete(`/eleves/${id}/`);
export const getEleveById = (id) => apiClient.get(`/eleves/${id}/`);


// --- Fichiers ---
// Pour Enseignant (CRUD complet)
export const getAllFichiers = () => apiClient.get('/fichiers/');
export const createFichier = (formData) => apiClient.post('/fichiers/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateFichier = (id, formData) => apiClient.put(`/fichiers/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteFichier = (id) => apiClient.delete(`/fichiers/${id}/`);
// Pour Eleve
export const getFichiersForEleve = (eleveId) => apiClient.get(`/eleve/${eleveId}/fichiers/`);


// --- Activites ---
// Pour Enseignant
export const getAllActivites = () => apiClient.get('/activites/');
export const createActivite = (formData) => apiClient.post('/activites/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateActivite = (id, formData) => apiClient.put(`/activites/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteActivite = (id) => apiClient.delete(`/activites/${id}/`);
export const getActivityProgress = (activiteId) => apiClient.get(`/activites/${activiteId}/progress/`);
// Pour Eleve
export const getActivitesForEleve = (eleveId) => apiClient.get(`/eleve/${eleveId}/activites/`);
export const markActiviteComplete = (data) => apiClient.post('/completer-activite/', data); // { eleve_id, activite_id }


// --- Exercices ---
// Pour Enseignant
export const getAllExercices = () => apiClient.get('/exercices/');
export const createExercice = (data) => apiClient.post('/exercices/', data);
export const updateExercice = (id, data) => apiClient.put(`/exercices/${id}/`, data);
export const deleteExercice = (id) => apiClient.delete(`/exercices/${id}/`);
export const getExerciceResponsesForTeacher = (exerciceId) => apiClient.get(`/exercices/${exerciceId}/responses/`);
export const gradeExerciceResponse = (responseId, data) => apiClient.patch(`/reponses-exercice/${responseId}/`, data); // data: { note, corrigee }
// Pour Eleve
export const getExercicesForEleve = (eleveId) => apiClient.get(`/eleve/${eleveId}/exercices/`);
export const submitExerciceResponse = (data) => apiClient.post('/soumettre-reponse/', data); // { eleve_id, exercice_id, reponse }


// --- Notes (Générales, non liées à un exercice spécifique) ---
// Pour Enseignant
export const getNotes = (params) => apiClient.get('/notes/', { params }); // params: { eleve_id, classe }
export const createNote = (data) => apiClient.post('/notes/', data);
export const updateNote = (id, data) => apiClient.put(`/notes/${id}/`, data);
export const deleteNote = (id) => apiClient.delete(`/notes/${id}/`);
// Pour Eleve
export const getNotesForEleve = (eleveId) => apiClient.get(`/eleve/${eleveId}/notes/`);


// --- Messages ---
// Pour Enseignant
export const getTeacherConversations = () => apiClient.get('/teacher/conversations/');
export const getMessagesForTeacher = (eleveId) => apiClient.get(`/teacher/messages/${eleveId}/`);
// Pour Eleve
export const getMessagesForEleve = (eleveId) => apiClient.get(`/eleve/${eleveId}/messages/`);
// Commun
export const sendMessage = (data) => apiClient.post('/envoyer-message/', data); // { eleve (ID), contenu, expediteur ('eleve' ou 'enseignant') }



// --- END OF FILE app/frontend/src/api.js ---

// --- MODIFIER app/frontend/src/api.js ---

// ... (toutes tes fonctions API existantes : loginEleve, getEleves, etc. sont au-dessus) ...

// --- Notifications (pour Élève) ---
export const getEleveNotifications = (eleveId, params) => {
    // params peut être { lu: false } pour les non lues, ou { lu: true } pour les lues, ou vide pour toutes
    return apiClient.get(`/eleve/${eleveId}/notifications/`, { params });
};

export const markNotificationAsRead = (eleveId, notificationId) => {
    return apiClient.post(`/eleve/${eleveId}/notifications/${notificationId}/mark-as-read/`);
};

export const markAllNotificationsAsRead = (eleveId) => {
    return apiClient.post(`/eleve/${eleveId}/notifications/mark-all-as-read/`);
};
// --- FIN DE L'AJOUT POUR NOTIFICATIONS ---


export default apiClient; 
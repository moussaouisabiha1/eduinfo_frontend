// --- START OF FILE app/frontend/src/pages/student/StudentDashboardRoutes.js ---
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentDashboardLayout from './StudentDashboardLayout';
import StudentHome from './StudentHome';
import StudentMessages from './StudentMessages';

// Importe les composants pour chaque section du dashboard élève
// Tu créeras ces fichiers ensuite. Pour l'instant, on peut définir des placeholders
// ou commenter les imports si les fichiers n'existent pas encore pour éviter les erreurs.

// Si les fichiers existent déjà (même vides avec un export default), tu peux les importer :
import StudentFiles from './StudentFiles';
import StudentActivities from './StudentActivities';
import StudentExercises from './StudentExercises';
import StudentGrades from './StudentGrades';

/*
// Si les fichiers n'existent pas encore, utilise ces placeholders temporairement :
const StudentFiles = () => <div className="section-content"><h2>Mes Fichiers</h2><p>Chargement...</p></div>;
const StudentActivities = () => <div className="section-content"><h2>Mes Activités</h2><p>Chargement...</p></div>;
const StudentExercises = () => <div className="section-content"><h2>Mes Exercices</h2><p>Chargement...</p></div>;
const StudentGrades = () => <div className="section-content"><h2>Mes Notes</h2><p>Chargement...</p></div>;
*/


const StudentDashboardRoutes = ({ currentUser, handleLogout }) => {
    // Si currentUser n'est pas encore chargé, on peut afficher un loader ou null
    // Cependant, ProtectedStudentRoute dans App.js devrait déjà gérer le cas où l'utilisateur n'est pas authentifié.
    // Mais currentUser peut être null brièvement pendant que App.js le récupère du localStorage.
    if (!currentUser) {
        return <div className="loading" style={{textAlign: 'center', padding: '50px'}}>Chargement des informations utilisateur...</div>;
    }

    return (
        <Routes>
            <Route path="/" element={<StudentDashboardLayout currentUser={currentUser} onLogout={handleLogout} />}>
                <Route index element={<StudentHome />} />
                <Route path="files" element={<StudentFiles currentUser={currentUser} />} />
                <Route path="activities" element={<StudentActivities currentUser={currentUser} />} />
                <Route path="exercises" element={<StudentExercises currentUser={currentUser} />} />
                <Route path="grades" element={<StudentGrades currentUser={currentUser} />} />
                <Route path="messages" element={<StudentMessages currentUser={currentUser} />} />
            </Route>
        </Routes>
    );
};

export default StudentDashboardRoutes;
// --- END OF FILE app/frontend/src/pages/student/StudentDashboardRoutes.js ---
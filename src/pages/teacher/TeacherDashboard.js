// --- START OF FILE app/frontend/src/pages/teacher/TeacherDashboard.js ---
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Teacher.css'; // Votre CSS existant pour le dashboard enseignant

// Importez les composants pour chaque section
import DashboardHome from './DashboardHome';
import ManageStudents from './ManageStudents';
import ManageFiles from './ManageFiles';
import ManageActivities from './ManageActivities';
import ManageExercises from './ManageExercises';
import ManageGrades from './ManageGrades';
import TeacherMessages from './TeacherMessages';

// Le composant TeacherDashboardLayout reçoit maintenant 'onLogout' en prop
function TeacherDashboardLayout({ onLogout }) { // <<<<<< MODIFICATION ICI: Ajout de la prop onLogout
    const navigate = useNavigate(); // useNavigate est toujours utile pour d'autres navigations si besoin
    const location = useLocation();
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        setActiveSection(path || 'home');
    }, [location]);

    // La fonction handleLogoutClick appelle maintenant la prop onLogout
    const handleLogoutClick = () => { // <<<<<< MODIFICATION ICI: Nom de la fonction locale
        if (onLogout) {
            onLogout(); // Appelle la fonction passée par App.js
        } else {
            // Fallback (ne devrait pas se produire si la prop est bien passée)
            console.warn("Fonction onLogout non fournie à TeacherDashboardLayout");
            sessionStorage.removeItem('teacherLoggedIn');
            navigate('/'); // Redirige vers la page d'accueil
        }
    };

    const menuItems = [
        { id: 'home', label: 'Accueil', icon: '🏠', path: '' },
        { id: 'students', label: 'Gestion Élèves', icon: '👨‍🎓', path: 'students' },
        { id: 'files', label: 'Gestion Fichiers', icon: '📁', path: 'files' },
        { id: 'activities', label: 'Gestion Activités', icon: '📝', path: 'activities' },
        { id: 'exercises', label: 'Gestion Exercices', icon: '🏋️‍♂️', path: 'exercises' },
        { id: 'grades', label: 'Gestion Notes', icon: '📊', path: 'grades' },
        { id: 'messages', label: 'Messagerie', icon: '💬', path: 'messages' },
    ];

    return (
        <div className="teacher-dashboard">
            <header className="dashboard-header">
                <span className="welcome-text">Tableau de Bord Enseignant</span>
                {/* Le bouton appelle maintenant handleLogoutClick */}
                <button onClick={handleLogoutClick} className="btn-logout">Déconnexion</button> {/* <<<<<< MODIFICATION ICI */}
            </header>
            <div className="dashboard-body">
                <aside className="sidebar">
                    <nav className="sidebar-menu">
                        {menuItems.map(item => (
                            <Link
                                key={item.id}
                                to={`/teacher/dashboard/${item.path}`}
                                className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-label">{item.label}</span>
                                {/* {item.badge > 0 && <span className="notification-badge">{item.badge}</span>} */}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

// TeacherRoutes reçoit 'onLogout' et le passe à TeacherDashboardLayout
export default function TeacherRoutes({ onLogout }) { // <<<<<< MODIFICATION ICI: Accepte la prop onLogout
    return (
        <Routes>
            {/* Passe la prop onLogout à TeacherDashboardLayout */}
            <Route path="/" element={<TeacherDashboardLayout onLogout={onLogout} />}> {/* <<<<<< MODIFICATION ICI */}
                <Route index element={<DashboardHome />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="files" element={<ManageFiles />} />
                <Route path="activities" element={<ManageActivities />} />
                <Route path="exercises" element={<ManageExercises />} />
                <Route path="grades" element={<ManageGrades />} />
                <Route path="messages" element={<TeacherMessages />} />
            </Route>
        </Routes>
    );
}
// --- END OF FILE app/frontend/src/pages/teacher/TeacherDashboard.js ---
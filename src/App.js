// --- START OF FILE app/frontend/src/App.js ---
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './styles/App.css';

import HomePage from './pages/HomePage';
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherRoutes from './pages/teacher/TeacherDashboard';
// IMPORTER LE NOUVEAU ROUTEUR DU DASHBOARD ÉLÈVE
import StudentDashboardRoutes from './pages/student/StudentDashboardRoutes';

function AppContent() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const teacherLoggedIn = sessionStorage.getItem('teacherLoggedIn') === 'true';
    const studentInfo = localStorage.getItem('studentInfo');

    if (teacherLoggedIn) {
      setUserType('teacher');
      setCurrentUser({ role: 'teacher' });
    } else if (studentInfo) {
      try {
        const parsedStudentInfo = JSON.parse(studentInfo);
        setUserType('student');
        setCurrentUser(parsedStudentInfo);
      } catch (e) {
        localStorage.removeItem('studentInfo');
      }
    }
  }, []);

  const handleLoginSuccess = (userData, type) => {
    setCurrentUser(userData);
    setUserType(type);
    if (type === 'teacher') {
      localStorage.removeItem('studentInfo');
      navigate('/teacher/dashboard');
    } else if (type === 'student') {
      localStorage.setItem('studentInfo', JSON.stringify(userData));
      sessionStorage.removeItem('teacherLoggedIn');
      navigate('/student/dashboard'); // La redirection est correcte
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType('');
    sessionStorage.removeItem('teacherLoggedIn');
    localStorage.removeItem('studentInfo');
    navigate('/');
  };

  const ProtectedTeacherRoute = ({ children }) => {
    const teacherLoggedIn = sessionStorage.getItem('teacherLoggedIn') === 'true';
    if (userType === 'teacher' || teacherLoggedIn) {
      if (userType !== 'teacher' && teacherLoggedIn) {
          setUserType('teacher');
          setCurrentUser({role: 'teacher'});
      }
      return children;
    }
    return <Navigate to="/" replace />;
  };

  const ProtectedStudentRoute = ({ children }) => {
    const studentInfo = localStorage.getItem('studentInfo');
    // Vérifie l'état local D'ABORD, puis localStorage pour la persistance
    if (userType === 'student' && currentUser?.id) {
        return children;
    } else if (!userType && studentInfo) { // Si l'état local est vide mais localStorage a des infos
        try {
            const parsedStudentInfo = JSON.parse(studentInfo);
            // Mettre à jour l'état local AVANT de rendre les enfants, pour éviter des rendus inutiles
            // Cela est délicat ici. Il est préférable que useEffect s'en charge.
            // Pour la protection de route, on se fie au fait que useEffect aura déjà tourné.
            // Si currentUser est toujours null ici mais studentInfo existe,
            // c'est que useEffect n'a pas encore mis à jour ou qu'il y a eu un problème.
            // On redirige par sécurité, useEffect corrigera au prochain rendu si studentInfo est valide.
            // Une solution plus robuste utiliserait un état "loadingAuth"
            if(parsedStudentInfo && parsedStudentInfo.id) {
                 //setCurrentUser(parsedStudentInfo); // Ne pas appeler setState dans le rendu
                 //setUserType('student');
                return children; // Laisse passer si localStorage est valide, useEffect s'occupera de l'état
            }
        } catch(e) { /* ignore parsing error */ }
    }
    return <Navigate to="/" replace />;
  };

  return (
    <div className="app-container">
      <Routes>
        <Route
          path="/"
          element={
            (userType === 'teacher') ? <Navigate to="/teacher/dashboard" replace /> :
            (userType === 'student') ? <Navigate to="/student/dashboard" replace /> :
            <HomePage onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
            path="/teacher/login"
            element={
                (userType === 'teacher') ? <Navigate to="/teacher/dashboard" replace /> :
                <TeacherLogin onLoginSuccess={handleLoginSuccess} />
            }
        />
        <Route
          path="/teacher/dashboard/*"
          element={
            <ProtectedTeacherRoute>
              <TeacherRoutes onLogout={handleLogout} />
            </ProtectedTeacherRoute>
          }
        />

        {/* DÉCOMMENTER ET UTILISER StudentDashboardRoutes */}
        <Route
          path="/student/dashboard/*"
          element={
            <ProtectedStudentRoute>
              {/* currentUser et handleLogout sont passés ici */}
              <StudentDashboardRoutes currentUser={currentUser} handleLogout={handleLogout} />
            </ProtectedStudentRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
// --- END OF FILE app/frontend/src/App.js ---
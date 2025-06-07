// --- START OF FILE app/frontend/src/pages/student/StudentHome.js ---
import React from 'react';
import { useNavigate } from 'react-router-dom';
// Si tu as un fichier CSS spécifique pour cette page, importe-le.
// Sinon, les styles de StudentDashboardLayout ou App.css s'appliqueront.
// import './StudentHome.css'; // Exemple

// Ce composant n'a plus besoin de 'user' et 'onLogout' en props,
// car ces informations sont gérées par StudentDashboardLayout.
// Il est maintenant une simple page de contenu à l'intérieur du layout.
const StudentHome = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'الملفات',
      icon: '📁',
      color: '#2962FF', // Ces couleurs peuvent être utilisées dans le CSS si tu le souhaites
      path: 'files' // Chemin relatif au dashboard élève
    },
    {
      title: 'الأنشطة',
      icon: '📝',
      color: '#00C853',
      path: 'activities'
    },
    {
      title: 'التمارين',
      icon: '✏️',
      color: '#FF6D00',
      path: 'exercises'
    },
    {
      title: 'علاماتي',
      icon: '⭐',
      color: '#9C27B0',
      path: 'grades' // Renommé de 'grade' à 'grades' pour correspondre à la route
    },
    {
      title: 'الرسائل',
      icon: '💬',
      color: '#F44336',
      path: 'messages'
    }
  ];

  // La div principale pourrait utiliser une classe comme "section-content"
  // pour s'aligner avec le style des autres pages du dashboard si tu le souhaites.
  // Les classes "student-dashboard", "dashboard-header", "welcome-text", "btn-logout"
  // sont maintenant dans StudentDashboardLayout.js
  return (
    <div className="section-content student-home-content"> {/* Nouvelle classe pour des styles spécifiques si besoin */}
      {/* Le message de bienvenue et le bouton de déconnexion sont maintenant dans StudentDashboardLayout.js */}
      {/* Tu peux ajouter un titre spécifique à cette page d'accueil si tu veux */}
      {/* <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Tableau de bord</h2> */}

      <div className="menu-grid">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="menu-card fade-in" // Tes classes CSS existantes
            style={{ animationDelay: `${index * 0.1}s`, cursor: 'pointer' }} // Ajout de cursor: pointer
            onClick={() => navigate(item.path)} // navigate(item.path) va naviguer vers /student/dashboard/ + item.path
          >
            <span
              className="menu-icon float" // Tes classes CSS existantes
              // style={{ color: item.color, animationDelay: `${index * 0.5}s` }} // Tu peux garder ou enlever ce style en ligne
            >
              {item.icon}
            </span>
            <div className="menu-title">{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentHome;
// --- END OF FILE app/frontend/src/pages/student/StudentHome.js ---
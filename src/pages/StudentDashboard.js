import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'الملفات',
      icon: '📁',
      color: '#2962FF',
      path: '/files'
    },
    {
      title: 'الأنشطة',
      icon: '📝',
      color: '#00C853',
      path: '/activities'
    },
    {
      title: 'التمارين',
      icon: '✏️',
      color: '#FF6D00',
      path: '/exercises'
    },
    {
      title: 'علامتي',
      icon: '⭐',
      color: '#9C27B0',
      path: '/grade'
    },
    {
      title: 'الرسائل',
      icon: '💬',
      color: '#F44336',
      path: '/messages'
    }
  ];

  return (
    <div className="student-dashboard">
      <div className="dashboard-header fade-in">
        <div className="welcome-text">
          مرحباً {user.prenom} {user.nom} - {user.classe}
        </div>
        <button className="btn-logout" onClick={onLogout}>
          تسجيل الخروج
        </button>
      </div>

      <div className="menu-grid">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            className="menu-card fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigate(item.path)}
          >
            <span 
              className="menu-icon float"
              style={{ color: item.color, animationDelay: `${index * 0.5}s` }}
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

export default StudentDashboard;
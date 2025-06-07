// --- START OF FILE app/frontend/src/pages/student/StudentDashboardLayout.js ---
import React, { useState, useEffect, useCallback, useRef } from 'react'; // AJOUT: useState, useEffect, useCallback, useRef
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

import { getEleveNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../api';


import '../../styles/App.css'; // Adapte si ton App.css global est ailleurs ou non utilisé ici
import './Student.css'; // Ton CSS spécifique pour l'élève

const StudentDashboardLayout = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- ÉTATS POUR LES NOTIFICATIONS ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const notificationsPanelRef = useRef(null); // Pour gérer le clic en dehors
  // --- FIN ÉTATS NOTIFICATIONS ---

  const handleStudentLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback si onLogout n'est pas fourni (ne devrait pas arriver si App.js est bien configuré)
      localStorage.removeItem('studentInfo');
      sessionStorage.removeItem('teacherLoggedIn'); // Au cas où
      navigate('/');
    }
  };

  // --- FONCTIONS POUR LES NOTIFICATIONS ---
  const fetchNotifications = useCallback(async () => {
    if (!currentUser || !currentUser.id) return;
    // Ne pas mettre setIsLoadingNotifications(true) ici pour un polling discret
    // sauf si c'est le premier chargement ou une action explicite de l'utilisateur.

    try {
      const unreadResponse = await getEleveNotifications(currentUser.id, { lu: false });
      setUnreadCount(unreadResponse.data.length);

      // Pour le panneau, on affiche les X dernières notifications, lues ou non
      // On peut les récupérer toutes et les trancher, ou demander au backend de paginer
      const allRecentResponse = await getEleveNotifications(currentUser.id); // Récupère toutes (triées par date par le backend)
      setNotifications(allRecentResponse.data.slice(0, 10)); // On garde les 10 plus récentes pour l'affichage

    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
    }
    // setIsLoadingNotifications(false); // Gérer le loader plus spécifiquement
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      setIsLoadingNotifications(true); // Loader pour le premier chargement
      fetchNotifications().finally(() => setIsLoadingNotifications(false)); // Appel initial

      const intervalId = setInterval(fetchNotifications, 60000); // Polling toutes les 60 secondes
      return () => clearInterval(intervalId);
    }
  }, [currentUser, fetchNotifications]);

  // Gérer les clics en dehors du panneau de notifications pour le fermer
  useEffect(() => {
    function handleClickOutside(event) {
      const bellIcon = document.getElementById('student-notification-bell-icon');
      if (
        notificationsPanelRef.current &&
        !notificationsPanelRef.current.contains(event.target) &&
        (!bellIcon || !bellIcon.contains(event.target)) // Ne pas fermer si on clique sur la cloche
      ) {
        setShowNotificationsPanel(false);
      }
    }
    if (showNotificationsPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationsPanel]);

  const handleNotificationClick = async (notification) => {
    if (notification.lien_relatif) {
      navigate(notification.lien_relatif);
    }
    setShowNotificationsPanel(false);

    if (!notification.lu && currentUser && currentUser.id) {
      try {
        await markNotificationAsRead(currentUser.id, notification.id);
        fetchNotifications(); // Rafraîchir
      } catch (error) {
        console.error("Erreur marquage notification comme lue:", error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser || !currentUser.id || unreadCount === 0) return;
    try {
      await markAllNotificationsAsRead(currentUser.id);
      fetchNotifications(); // Rafraîchir
      // setShowNotificationsPanel(false); // Optionnel: garder ouvert ou fermer
    } catch (error) {
      console.error("Erreur marquage toutes notifications comme lues:", error);
    }
  };

  const toggleNotificationsPanel = () => {
    setShowNotificationsPanel(prev => !prev);
    // Si on ouvre le panneau et qu'il y a des non lues, on peut les rafraîchir
    if (!showNotificationsPanel && unreadCount > 0) {
        fetchNotifications(); // Pour s'assurer d'avoir les dernières données
    }
  };
  // --- FIN FONCTIONS NOTIFICATIONS ---

  if (!currentUser) {
    return <p className="loading-text">⏳ تحميل المعلومات ...</p>; // Gardé de ton code
  }

  const menuItems = [
    { label: 'الرئيسية', path: '', icon: '🏠' }, // Pour /student/dashboard/
    { label: 'ملفاتي', path: 'files', icon: '📁' },
    { label: 'أنشطتي', path: 'activities', icon: '📝' },
    { label: 'تماريني', path: 'exercises', icon: '🏋️‍♂️' },
    { label: 'علاماتي', path: 'grades', icon: '📊' },
    { label: 'الرسائل', path: 'messages', icon: '💬' },
  ];

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <span>
          👋 مرحباً {currentUser.prenom} {currentUser.nom} ({currentUser.classe?.toUpperCase()})
        </span>
        <span className="subject-tag">💻 المعلوماتية</span>
{/* --- DÉBUT SECTION NOTIFICATIONS DANS LE HEADER --- */}
            <div className="notifications-icon-container " style={{ position: 'relative', marginRight: '20px' }}>
                <button
                    id="student-notification-bell-icon" // ID pour la gestion du clic extérieur
                    onClick={toggleNotificationsPanel}
                    className="btn-icon" // Tu devras styler cette classe
                    title="الإشعارات"
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', position: 'relative', color: 'inherit' /* Pour hériter la couleur du header */ }}
                >
                    🔔 {/* Icône de cloche */}
                    {unreadCount > 0 && (
                        <span className="notification-badge" style={{
                            position: 'absolute', top: '-5px', right: '-5px', background: '#f44336',
                            color: 'white', borderRadius: '50%', padding: '1px 5px',
                            fontSize: '0.75rem', fontWeight: 'bold', lineHeight: '1.2'
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </button>

                {showNotificationsPanel && (
                    <div ref={notificationsPanelRef} className="notifications-panel" style={{
                        position: 'absolute', top: '120%', /* Ajuste pour bien se positionner */ right: '-50px', /* Ajuste */
                        width: '320px', maxHeight: '450px', overflowY: 'auto',
                        backgroundColor: 'white', border: '1px solid #ddd',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1001,
                        borderRadius: '8px', color: '#333' /* Couleur de texte par défaut pour le panneau */
                    }}>
                        <div style={{ padding: '12px 15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>الإشعارات</h4>
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllAsRead} className="btn-link" style={{
                                    fontSize: '0.8rem', color: '#007bff', background: 'none',
                                    border: 'none', cursor: 'pointer', padding: '0'
                                }}>
                                    وضع علامة على الكل كمقروء
                                </button>
                            )}
                        </div>
                        {isLoadingNotifications && notifications.length === 0 && <p style={{padding: '15px', textAlign: 'center', color: '#777'}}>⏳ تحميل...</p>}
                        {!isLoadingNotifications && notifications.length === 0 && <p style={{padding: '20px', textAlign: 'center', color: '#777'}}>لا توجد إشعارات جديدة</p>}
                        
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {notifications.map(notif => (
                                <li
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    style={{
                                        padding: '12px 15px',
                                        borderBottom: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                        backgroundColor: notif.lu ? 'transparent' : '#e8f0fe', // Style pour non lues
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    className={`notification-item ${!notif.lu ? 'unread' : ''}`} // Classe pour cibler en CSS
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = notif.lu ? '#f9f9f9' : '#dce9fd'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = notif.lu ? 'transparent' : '#e8f0fe'}
                                >
                                    <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: !notif.lu ? '600' : 'normal', color: '#333' }}>
                                        {notif.message}
                                    </p>
                                    <small style={{ color: '#666', fontSize: '0.75rem' }}>
                                        {new Date(notif.date_creation).toLocaleString('ar-DZ', { /* Options pour le formatage arabe */
                                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </small>
                                </li>
                            ))}
                        </ul>
                        {notifications.length > 0 && notifications.length >=10 && (
                             <div style={{padding: '10px', textAlign: 'center', fontSize: '0.8em', color: '#777'}}>
                                Affichage des 10 notifications les plus récentes.
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* --- FIN SECTION NOTIFICATIONS --- */}
        {/* --- CONTENEUR POUR LES ICÔNES DE DROITE (NOTIFICATIONS ET DÉCONNEXION) --- */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center' }}>
            

            <button className="btn-logout" onClick={handleStudentLogout}>
              🚪 تسجيل الخروج
            </button>
        </div> {/* Fin header-actions */}
      </header>

      <div className="dashboard-body">
        <aside className="sidebar">
          <nav className="sidebar-menu">
            {menuItems.map(item => {
              // Pour 'Accueil', le chemin exact est /student/dashboard/
              // Pour les autres, c'est /student/dashboard/quelquechose
              const isActive = item.path === '' ?
                               location.pathname === '/student/dashboard' || location.pathname === '/student/dashboard/' :
                               location.pathname.startsWith(`/student/dashboard/${item.path}`);
              return (
                <Link
                  key={item.label}
                  to={`/student/dashboard/${item.path}`} // Le chemin est construit correctement
                  className={`menu-item ${isActive ? 'active' : ''}`}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span>{item.label}</span> {/* Gardé span pour la cohérence */}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardLayout;

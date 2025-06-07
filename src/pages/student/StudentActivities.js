// --- START OF FILE app/frontend/src/pages/student/StudentActivities.js ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivitesForEleve, markActiviteComplete } from '../../api'; // Ajuste le chemin
import '../../styles/App.css';

const StudentActivities = ({ currentUser }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && currentUser.id) {
      const loadActivities = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await getActivitesForEleve(currentUser.id);
          // Le serializer backend ajoute `completion_status` pour chaque activité
          setActivities(response.data);
        } catch (err) {
          console.error("خطأ في تحميل أنشطة المتعلم:", err.response || err);
          setError('Impossible de charger les activités.');
        } finally {
          setLoading(false);
        }
      };
      loadActivities();
    } else {
        setError('Informations utilisateur non disponibles.');
        setLoading(false);
    }
  }, [currentUser]);

  const handleCompleteActivity = async (activiteId) => {
    if (!currentUser || !currentUser.id) return;
    
    // Optimistic update: Marquer comme complétée dans l'UI d'abord
    setActivities(prevActivities =>
      prevActivities.map(act =>
        act.id === activiteId ? { ...act, completion_status: true } : act
      )
    );

    try {
      await markActiviteComplete({ eleve_id: currentUser.id, activite_id: activiteId });
      // Pas besoin de recharger, l'UI est déjà à jour.
      // On pourrait ajouter une notification de succès.
    } catch (err) {
      console.error("Erreur marquer activité complète:", err.response || err);
      alert('Une erreur s\'est produite. L\'activité n\'a peut-être pas été marquée comme complétée côté serveur.');
      // Rollback optimistic update en cas d'erreur serveur
      setActivities(prevActivities =>
        prevActivities.map(act =>
          act.id === activiteId ? { ...act, completion_status: false } : act // Revert
        )
      );
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return <div className="loading section-content" style={{padding: '20px', textAlign: 'center'}}>تحميل الأنشطة...</div>;
  }

  return (
    <div className="section-content">
      <div className="section-header">
        <h2>📝 قائمة الأنشطة</h2>
        <button className="btn-secondary" onClick={() => navigate('/student/dashboard')}>
            ← العودة
        </button>
      </div>

      {error && <div className="error" style={{color: 'red', margin: '15px 0'}}>{error}</div>}

      {activities.length === 0 && !loading && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>لا يوجد أي نشاط في الوقت الحالي.</p>
      )}

      <div className="item-list" style={{marginTop: '20px'}}>
        {activities.map(activity => (
          <div key={activity.id} className="item-card">
            <h3 className="item-title">{activity.titre}</h3>
            <p className="item-description" style={{whiteSpace: 'pre-wrap'}}>{activity.description}</p>
            {activity.fichier_joint && (
              <a 
                href={activity.fichier_joint} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-action btn-secondary" // ou btn-secondary
                style={{textDecoration: 'none', marginRight: '10px', display: 'inline-block', marginBottom:'10px'}}
              >
                📎 أطلع على الملف المرفق
              </a>
            )}
            <p style={{fontSize: '0.8em', color: '#777'}}>تاريخ الإنشاء: {formatDate(activity.date_creation)}</p>

            <div className="item-actions" style={{marginTop: '15px'}}>
              {activity.completion_status ? (
                <span className="status-badge status-completed">✅ مكتمل</span>
              ) : (
                <button 
                  onClick={() => handleCompleteActivity(activity.id)}
                  className="btn-action btn-success" // ou btn-success
                >
                  🏁 تمّ الإنجاز
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentActivities;
// --- END OF FILE app/frontend/src/pages/student/StudentActivities.js ---
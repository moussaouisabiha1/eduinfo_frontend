// --- START OF FILE app/frontend/src/pages/student/StudentGrades.js ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotesForEleve } from '../../api'; // Ajuste le chemin
import '../../styles/App.css'; // Tes styles globaux

const StudentGrades = ({ currentUser }) => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && currentUser.id) {
      const loadGrades = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await getNotesForEleve(currentUser.id);
          setGrades(response.data); // Le backend retourne une liste, même vide
        } catch (err) {
          console.error("Erreur chargement notes élève:", err.response || err);
          if (err.response && err.response.status === 404) {
            // Si l'API retourne 404 pour "pas de notes", on met une liste vide
            setGrades([]); 
          } else {
            setError('Impossible de charger vos notes.');
          }
        } finally {
          setLoading(false);
        }
      };
      loadGrades();
    } else {
        setError('Informations utilisateur non disponibles.');
        setLoading(false);
    }
  }, [currentUser]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading section-content" style={{padding: '20px', textAlign: 'center'}}>تحميل العلامات...</div>;
  }

  return (
    <div className="section-content">
      <div className="section-header">
        <h2>⭐ العلامة التي تحصلت عليها</h2>
        <button className="btn-secondary btn-small" onClick={() => navigate('/student/dashboard')}>
            ← العودة
        </button>
      </div>

      {error && <div className="error" style={{color: 'red', margin: '15px 0'}}>{error}</div>}

      {grades.length === 0 && !loading && (
        <div className="note-display" style={{textAlign: 'center', padding: '20px', background: '#f0f0f0', borderRadius: '8px', marginTop: '20px'}}>
          <p style={{fontSize: '1.2em', color: '#555'}}>لا توجد أي علامة.</p>
        </div>
      )}

      {grades.length > 0 && (
        <div className="item-list" style={{marginTop: '20px'}}>
          {grades.map(grade => (
            <div key={grade.id} className="item-card"> {/* Ou une classe spécifique pour les notes */}
                <div className="note-display" style={{
                    padding: '20px', 
                    borderRadius: '15px', 
                    marginBottom: '10px',
                    color: 'white',
                    background: parseFloat(grade.note) >= 10 ? 'linear-gradient(135deg, var(--success), #4caf50)' : 'linear-gradient(135deg, var(--warning), #f57c00)'
                    // background: `linear-gradient(135deg, ${parseFloat(grade.note) >= 10 ? '#00C853' : '#FF6D00'}, ${parseFloat(grade.note) >= 10 ? '#4caf50' : '#f57c00'})`
                }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span className="note-value" style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{grade.note} <span className="note-total" style={{fontSize: '1.2rem', opacity: '0.8'}}>/ 20</span></span>
                        <span style={{fontSize: '0.9em', opacity: '0.9'}}>تم الاستلام: {formatDate(grade.date_attribution)}</span>
                    </div>
                </div>
              {grade.commentaire && (
                <div className="note-comment" style={{background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0'}}>
                  <strong>ملاحظة الأستاذة :</strong>
                  <p style={{marginTop: '5px', whiteSpace: 'pre-wrap'}}>{grade.commentaire}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentGrades;
// --- END OF FILE app/frontend/src/pages/student/StudentGrades.js ---
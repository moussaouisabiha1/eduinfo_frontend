// --- START OF FILE app/frontend/src/pages/student/StudentExercises.js ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExercicesForEleve, submitExerciceResponse } from '../../api'; // Ajuste le chemin
import '../../styles/App.css'; // Tes styles globaux

const StudentExercises = ({ currentUser }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // État pour gérer la réponse en cours de rédaction pour un exercice
  const [currentResponses, setCurrentResponses] = useState({}); // { exerciceId: "texte de la réponse" }
  const [submittingResponse, setSubmittingResponse] = useState(null); // ID de l'exercice en cours de soumission

  useEffect(() => {
    if (currentUser && currentUser.id) {
      const loadExercises = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await getExercicesForEleve(currentUser.id);
          // Le serializer backend ajoute `reponse_eleve`
          setExercises(response.data);
          // Initialiser currentResponses avec les réponses existantes pour permettre la modification
          const initialResponses = {};
          response.data.forEach(ex => {
            if (ex.reponse_eleve && ex.reponse_eleve.reponse) {
              initialResponses[ex.id] = ex.reponse_eleve.reponse;
            } else {
              initialResponses[ex.id] = '';
            }
          });
          setCurrentResponses(initialResponses);
        } catch (err) {
          console.error("Erreur chargement exercices élève:", err.response || err);
          setError('Impossible de charger les exercices.');
        } finally {
          setLoading(false);
        }
      };
      loadExercises();
    } else {
        setError('Informations utilisateur non disponibles.');
        setLoading(false);
    }
  }, [currentUser]);

  const handleResponseChange = (exerciceId, value) => {
    setCurrentResponses(prev => ({
      ...prev,
      [exerciceId]: value
    }));
  };

  const handleSubmitResponse = async (exerciceId) => {
    if (!currentUser || !currentUser.id || !currentResponses[exerciceId]?.trim()) {
        alert("يرجى كتابة إجابة");
        return;
    }

    setSubmittingResponse(exerciceId);
    setError('');
    try {
      const responseData = {
        eleve_id: currentUser.id,
        exercice_id: exerciceId,
        reponse: currentResponses[exerciceId].trim()
      };
      await submitExerciceResponse(responseData);
      // Recharger les exercices pour voir la réponse mise à jour et la note potentielle
      // Ou, mettre à jour l'état local de manière optimiste
      setExercises(prevExercises => 
        prevExercises.map(ex => 
          ex.id === exerciceId 
          ? { ...ex, reponse_eleve: { reponse: currentResponses[exerciceId].trim(), corrigee: false, note: null } } 
          : ex
        )
      );
      alert('تمّ إرسال الرسالة بنجاح !');
    } catch (err) {
      console.error("Erreur soumission réponse:", err.response || err);
      alert('Erreur lors de la soumission de la réponse.');
    } finally {
      setSubmittingResponse(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return <div className="loading section-content" style={{padding: '20px', textAlign: 'center'}}>تحميل التمارين...</div>;
  }

  return (
    <div className="section-content">
      <div className="section-header">
        <h2>✏️ التمارين</h2>
        <button className="btn-secondary btn-small" onClick={() => navigate('/student/dashboard')}>
            ← العودة
        </button>
      </div>

      {error && <div className="error" style={{color: 'red', margin: '15px 0'}}>{error}</div>}

      {exercises.length === 0 && !loading && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Aucun exercice disponible pour le moment.</p>
      )}

      <div className="item-list" style={{marginTop: '20px'}}>
        {exercises.map(exercise => (
          <div key={exercise.id} className="item-card">
            <h3 className="item-title">{exercise.titre}</h3>
            <p className="item-description" style={{whiteSpace: 'pre-wrap', background: '#f8f9fa', padding: '10px', borderRadius: '5px', border: '1px solid #eef'}}>
                <strong>التعليمات :</strong><br/>
                {exercise.enonce}
            </p>
            <p style={{fontSize: '0.8em', color: '#777'}}>Date de création: {formatDate(exercise.date_creation)}</p>

            <div className="form-container" style={{marginTop: '15px', marginBottom: '15px'}}>
              <label className="form-label" htmlFor={`reponse-${exercise.id}`}>إجابتك :</label>
              <textarea
                id={`reponse-${exercise.id}`}
                className="textarea"
                rows="4"
                value={currentResponses[exercise.id] || ''}
                onChange={(e) => handleResponseChange(exercise.id, e.target.value)}
                placeholder="اكتب إجابتك هنا..."
                disabled={submittingResponse === exercise.id || exercise.reponse_eleve?.corrigee} // Désactive si corrigé
              />
            </div>

            {exercise.reponse_eleve && (
              <div style={{padding: '10px', background: exercise.reponse_eleve.corrigee ? '#e6ffed' : '#fff9c4', borderRadius: '5px', marginBottom: '10px'}}>
                <p><strong>إجابتك السابقة :</strong> {exercise.reponse_eleve.reponse}</p>
                {exercise.reponse_eleve.corrigee ? (
                  <p style={{color: 'green', fontWeight: 'bold'}}>
                    التصحيح - العلامة : {exercise.reponse_eleve.note !== null ? `${exercise.reponse_eleve.note}/20` : 'غير منقط'}
                  </p>
                ) : (
                  <p style={{color: 'orange'}}>في انتضار التصحيح.</p>
                )}
              </div>
            )}
            
            <div className="item-actions">
                {!exercise.reponse_eleve?.corrigee && ( // N'affiche le bouton que si ce n'est pas encore corrigé
                    <button
                        onClick={() => handleSubmitResponse(exercise.id)}
                        className="btn-action btn-primary" // ou btn-primary
                        disabled={submittingResponse === exercise.id || !currentResponses[exercise.id]?.trim()}
                    >
                        {submittingResponse === exercise.id ? 'إرسال...' : (exercise.reponse_eleve ? 'إعادة إرسال الإجابة' : 'إرسال الإجابة')}
                    </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentExercises;
// --- END OF FILE app/frontend/src/pages/student/StudentExercises.js ---
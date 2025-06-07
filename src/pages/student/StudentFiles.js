// --- START OF FILE app/frontend/src/pages/student/StudentFiles.js ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFichiersForEleve } from '../../api'; // Ajuste le chemin si besoin
import '../../styles/App.css'; // Tes styles globaux

const StudentFiles = ({ currentUser }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && currentUser.id) {
      const loadFiles = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await getFichiersForEleve(currentUser.id);
          setFiles(response.data);
        } catch (err) {
          console.error("خطأ في تحميل الملفات:", err.response || err);
          setError('Impossible de charger les fichiers. Veuillez réessayer plus tard.');
        } finally {
          setLoading(false);
        }
      };
      loadFiles();
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
    return <div className="loading section-content" style={{padding: '20px', textAlign: 'center'}}>تحميل الملفات...</div>;
  }

  return (
    <div className="section-content">
      <div className="section-header">
        <h2>📁 كل الملفات</h2>
        <button className="btn-secondary" onClick={() => navigate('/student/dashboard')}>
            ← العودة
        </button>
      </div>

      {error && <div className="error" style={{color: 'red', margin: '15px 0', padding: '10px', border: '1px solid red'}}>{error}</div>}

      {files.length === 0 && !loading && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>لايوجد أي ملف لقسمك</p>
      )}

      <div className="item-list" style={{marginTop: '20px'}}> {/* Ou 'files-grid' si tu préfères un layout en grille */}
        {files.map(file => (
          <div key={file.id} className="item-card"> {/* Utilise tes classes CSS 'item-card' ou 'file-card' */}
            <h3 className="item-title" style={{color: 'var(--primary)'}}>{file.titre}</h3>
            <p className="item-description" style={{fontSize: '0.9em', color: '#555'}}>
              Classes cibles: {file.classes_cibles ? file.classes_cibles.toUpperCase() : 'N/A'}
            </p>
            <p className="item-description" style={{fontSize: '0.8em', color: '#777'}}>
              Date de partage: {formatDate(file.date_upload)}
            </p>
            <div className="item-actions" style={{marginTop: '15px'}}>
              <a 
                href={file.fichier} // Lien direct vers le fichier (Cloudinary ou media local)
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-action btn-primary" // ou simplement btn-primary
                style={{textDecoration: 'none'}}
              >
                📥 تحميل / فتح
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentFiles;
// --- END OF FILE app/frontend/src/pages/student/StudentFiles.js ---
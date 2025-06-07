// --- START OF FILE app/frontend/src/pages/HomePage.js ---
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Chemin corrigé: api.js est un niveau au-dessus du dossier 'pages'
import { loginEleve as loginEleveApi } from '../api';
// Importe les styles globaux si nécessaire, ou des styles spécifiques à HomePage
import '../styles/App.css'; // Si tes classes .home-page etc. sont là (chemin depuis src/pages/)

const HomePage = ({ onLoginSuccess }) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) {
      setError('يرجى إدخال الاسم واللقب');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await loginEleveApi({ nom: nom.trim(), prenom: prenom.trim() });

      if (response.data.success && response.data.eleve) {
        if (onLoginSuccess) {
            onLoginSuccess(response.data.eleve, 'student');
        } else {
            // Fallback si onLoginSuccess n'est pas fourni (ne devrait pas arriver avec App.js actuel)
            localStorage.setItem('studentInfo', JSON.stringify(response.data.eleve));
            navigate('/student/dashboard');
        }
      } else {
        setError(response.data.message || 'فشل تسجيل دخول الطالب. تأكد من الاسم واللقب.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في تسجيل الدخول. حاول مرة أخرى.');
      console.error("Erreur login élève:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-container fade-in">
        <Link to="/teacher/login" className="admin-icon" title="دخول الأستاذ">
          🚀
        </Link>

        <h1 className="home-title">💻منصة تعليمية رقمية</h1>
        <p className="home-subtitle">🧠المعلوماتية - التعليم المتوسط</p>

        {error && <div className="error" style={{color: 'red', margin: '15px 0', padding: '10px', border: '1px solid red', borderRadius: '5px', textAlign: 'center'}}>{error}</div>}

        <form onSubmit={handleStudentLogin} className="login-form">
          <h2 style={{marginBottom: '20px', fontSize: '1.3em', color: '#4A5568', fontWeight: '600'}}>🎓تسجيل دخول التلميذ🎓</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="studentName">👤 الاسم</label>
            <input
              id="studentName"
              type="text"
              className="form-input"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="أدخل اسمك.........."
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="studentSurname">🧒اللقب</label>
            <input
              id="studentSurname"
              type="text"
              className="form-input"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="أدخل لقبك.........."
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{marginTop: '15px', width: '100%'}}
          >
            {loading ? 'جاري التحقق...' : '🚪تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
// --- END OF FILE app/frontend/src/pages/HomePage.js ---
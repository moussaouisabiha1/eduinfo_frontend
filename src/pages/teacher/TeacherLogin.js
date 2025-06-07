// --- START OF FILE app/frontend/src/pages/teacher/TeacherLogin.js ---
import React, { useState } from 'react';
// Chemin correct si api.js est dans src/api.js et TeacherLogin.js dans src/pages/teacher/
import { loginTeacher as loginEnseignantApi } from '../../api';
// Ajuste le chemin vers tes styles si nécessaire
import '../../styles/App.css'; // Si TeacherLogin utilise des styles globaux de App.css
import './Teacher.css'; // Si TeacherLogin utilise aussi des styles spécifiques du TeacherDashboard

const TeacherLogin = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('يرجى إدخال كلمة المرور');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await loginEnseignantApi({ password });
            if (response.data.success) {
                sessionStorage.setItem('teacherLoggedIn', 'true');
                if (onLoginSuccess) {
                    onLoginSuccess({ role: 'teacher', message: response.data.message }, 'teacher');
                }
                // La redirection est gérée par App.js après l'appel de onLoginSuccess
            } else {
                setError(response.data.message || 'Échec de la connexion.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur de connexion. Vérifiez le mot de passe.');
            console.error("Erreur de login enseignant:", err.response || err);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Tu peux utiliser les classes .home-page et .home-container si le style te convient
        // ou créer des classes spécifiques pour la page de login enseignant.
        <div className="home-page"> {/* Ou une classe comme "teacher-login-page" */}
            <div className="home-container"> {/* Ou "teacher-login-container" */}
                <h1 className="home-title">Espace Enseignant👩‍🏫</h1>
                <p className="home-subtitle">💻Informatique collège💻</p>

                {error && <div className="error" style={{color: 'red', margin: '15px 0', padding: '10px', border: '1px solid red', borderRadius: '5px', textAlign: 'center'}}>{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="password_teacher_login">🌈كلمة المرور✨</label>
                        <input
                            type="password"
                            id="password_teacher_login"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                           
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{marginTop: '15px', width: '100%'}} disabled={loading}>
                        {loading ? 'Connexion...' : '✨Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default TeacherLogin;
// --- END OF FILE app/frontend/src/pages/teacher/TeacherLogin.js ---
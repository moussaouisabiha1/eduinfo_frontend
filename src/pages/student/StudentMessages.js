// --- START OF FILE app/frontend/src/pages/student/StudentMessages.js ---
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Pour la navigation
// Importer les fonctions depuis notre fichier api.js centralisé
// Le chemin est depuis src/pages/student/ vers src/
import { getMessagesForEleve, sendMessage as sendApiMessage } from '../../api';
// Importe tes styles. Si tes classes sont dans App.css à la racine de src/styles/ :
import '../../styles/App.css'; // Ajuste si tes styles sont ailleurs
// Si tu as un CSS spécifique pour les messages élève :
// import './StudentMessages.css';

const StudentMessages = ({ currentUser }) => { // currentUser est passé par StudentDashboardLayout
  const [messageList, setMessageList] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const messagesEndRef = useRef(null); // Pour l'auto-scroll

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]); // Se déclenche quand messageList est mis à jour

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentUser || !currentUser.id) {
        setError('Informations utilisateur non disponibles.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const response = await getMessagesForEleve(currentUser.id);
        setMessageList(response.data);
      } catch (error) {
        console.error("Erreur de chargement des messages:", error.response || error);
        setError('فشل في تحميل الرسائل. حاول تحديث الصفحة.');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Optionnel: Polling pour les nouveaux messages
    // const intervalId = setInterval(loadMessages, 15000); // Toutes les 15 secondes
    // return () => clearInterval(intervalId);
  }, [currentUser]); // Se redéclenche si currentUser change (ne devrait pas arriver souvent ici)

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !currentUser.id) return;

    setSending(true);
    setError(''); // Clear previous errors
    try {
      const messageData = {
        eleve: currentUser.id, // L'ID de l'élève actuellement connecté
        contenu: newMessage.trim(),
        expediteur: 'eleve' // L'élève est l'expéditeur
      };

      const response = await sendApiMessage(messageData); // Utilise sendApiMessage
      setMessageList(prevMessages => [...prevMessages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error("Erreur d'envoi du message:", error.response || error);
      // Afficher l'erreur du backend si disponible
      const backendError = error.response?.data?.contenu || error.response?.data?.detail;
      alert(backendError || 'فشل في إرسال الرسالة. حاول مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', { // fr-FR pour un format plus standard, ou garde ar-DZ
      // year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
    });
  };

  // Gestion du bouton "Retour"
  const handleBackNavigation = () => {
    navigate('/student/dashboard'); // Retourne à l'accueil du dashboard élève
  };

  if (loading) {
    return (
      <div className="content-page"> {/* Assure-toi que cette classe existe et est stylée */}
        <div className="content-container">
          <div className="loading" style={{padding: '20px', textAlign: 'center'}}>جاري تحميل الرسائل...</div>
        </div>
      </div>
    );
  }

  return (
    // Ces classes 'content-page', 'content-container' etc. viennent de tes styles globaux (App.css)
    // ou d'un CSS spécifique au dashboard élève.
    <div className="section-content"> {/* Utilise la classe standard des sections de dashboard */}
      {/* Le header fait maintenant partie du StudentDashboardLayout */}
      {/* Si tu veux un header spécifique à cette page, ajoute-le ici */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{margin: 0}}>💬 الرسائل مع الأستاذة</h2>
        <button className="btn-secondary btn-small" onClick={handleBackNavigation}>
            ← العودة إلى الصفحة الرئيسية
        </button>
      </div>

      {/* content-body devient le conteneur principal ici */}
      <div style={{marginTop: '20px'}}>
        {error && <div className="error" style={{color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid red'}}>{error}</div>}

        <div className="message-list" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginBottom: '20px', background: '#fdfdff' }}>
          {messageList.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
              💬 لا توجد رسائل بعد. يمكنك بدأ المحادثة.
            </div>
          ) : (
            messageList.map((message) => (
              <div
                key={message.id} // Utilise message.id qui est unique
                className={`message-item ${message.expediteur === 'eleve' ? 'message-eleve' : 'message-enseignant'}`}
                // Applique tes styles message-item, message-eleve, message-enseignant
                // Exemple de styles en ligne (mieux dans un CSS) :
                style={{
                    padding: '10px 15px',
                    borderRadius: '12px',
                    marginBottom: '10px',
                    maxWidth: '75%',
                    wordWrap: 'break-word',
                    alignSelf: message.expediteur === 'eleve' ? 'flex-end' : 'flex-start',
                    background: message.expediteur === 'eleve' ? '#dcf8c6' : '#fff',
                    border: message.expediteur === 'eleve' ? '1px solid #c5e5b1' : '1px solid #e0e0e0',
                    marginLeft: message.expediteur === 'eleve' ? 'auto' : '0',
                    marginRight: message.expediteur === 'enseignant' ? 'auto' : '0',
                }}
              >
                <div className="message-content" style={{ marginBottom: '5px' }}>{message.contenu}</div>
                <div className="message-time" style={{ fontSize: '0.75em', color: '#777', textAlign: message.expediteur === 'eleve' ? 'right' : 'left' }}>
                  {message.expediteur === 'eleve' ? 'أنت' : 'الأستاذ'} - {formatDate(message.date_envoi)}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} /> {/* Pour l'auto-scroll */}
        </div>

        <form onSubmit={handleSendMessage} className="form-container" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <label className="form-label" htmlFor="newMessageText">رسالة جديدة:</label>
          <textarea
            id="newMessageText"
            className="textarea" // Ta classe CSS existante
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك للأستاذ هنا..."
            disabled={sending || !currentUser}
            rows="3"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '10px' }}
          />
          <div className="item-actions" style={{ marginTop: '10px', textAlign: 'right' }}>
            <button
              type="submit"
              className="btn-primary" // Utilise btn-primary ou btn-action si défini
              disabled={sending || !newMessage.trim() || !currentUser}
            >
              {sending ? '⏳ جاري الإرسال...' : '📤 إرسال'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentMessages;
// --- END OF FILE app/frontend/src/pages/student/StudentMessages.js ---
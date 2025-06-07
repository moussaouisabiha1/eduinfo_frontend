// --- START OF FILE app/frontend/src/pages/teacher/TeacherMessages.js ---
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getTeacherConversations, getMessagesForTeacher, sendMessage } from '../../api';
import './Teacher.css'; // Votre CSS

function TeacherMessages() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null); // eleve object from conversation list
    const [messages, setMessages] = useState([]);
    const [newMessageContent, setNewMessageContent] = useState('');
    
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [error, setError] = useState('');

    const messagesEndRef = useRef(null); // Pour scroller en bas de la liste des messages

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]); // Scrolle quand les messages changent

    const fetchConversations = useCallback(async () => {
        setIsLoadingConversations(true);
        setError('');
        try {
            const response = await getTeacherConversations();
            setConversations(response.data);
        } catch (err) {
            setError('Erreur lors de la récupération des conversations.');
            console.error("Erreur fetchConversations:", err.response?.data || err.message);
        }
        setIsLoadingConversations(false);
    }, []);

    useEffect(() => {
        fetchConversations();
        // Optionnel: Mettre en place un polling pour les nouvelles conversations/messages
        // const intervalId = setInterval(fetchConversations, 30000); // Toutes les 30 secondes
        // return () => clearInterval(intervalId);
    }, [fetchConversations]);

    const handleSelectConversation = async (convo) => {
        setSelectedConversation(convo);
        setIsLoadingMessages(true);
        setMessages([]);
        setError('');
        try {
            const response = await getMessagesForTeacher(convo.eleve_id);
            setMessages(response.data);
            // Mettre à jour le compteur de non-lus localement si besoin (ou refetch conversations)
             setConversations(prevConvos => prevConvos.map(c => 
                c.eleve_id === convo.eleve_id ? { ...c, non_lus_enseignant: 0 } : c
            ));
        } catch (err) {
            setError(`Erreur lors de la récupération des messages pour ${convo.eleve_prenom} ${convo.eleve_nom}.`);
            console.error("Erreur handleSelectConversation:", err.response?.data || err.message);
        }
        setIsLoadingMessages(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessageContent.trim() || !selectedConversation) return;

        setIsSendingMessage(true);
        setError('');
        try {
            const messageData = {
                eleve: selectedConversation.eleve_id,
                contenu: newMessageContent,
                expediteur: 'enseignant' // L'enseignant est toujours l'expéditeur ici
            };
            const response = await sendMessage(messageData);
            setMessages(prevMessages => [...prevMessages, response.data]); // Ajoute le nouveau message à la liste
            setNewMessageContent('');
            // Optionnel: Mettre à jour l'heure du dernier message dans la liste des conversations
            fetchConversations(); // Le plus simple est de recharger les conversations
        } catch (err) {
            setError('Erreur lors de l\'envoi du message.');
            console.error("Erreur handleSendMessage:", err.response?.data || err.message);
        }
        setIsSendingMessage(false);
    };

    return (
        <div className="section-content">
            <div className="section-header">
                <h2>Messagerie Enseignant</h2>
            </div>
            {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
            <div className="messages-container">
                <div className="conversations-list">
                    {isLoadingConversations && <p className="loading">Chargement des conversations...</p>}
                    {!isLoadingConversations && conversations.length === 0 && <p className="no-data">Aucune conversation en cours.</p>}
                    {conversations.map(convo => (
                        <div 
                            key={convo.eleve_id} 
                            className={`conversation-item ${selectedConversation?.eleve_id === convo.eleve_id ? 'selected' : ''}`}
                            onClick={() => handleSelectConversation(convo)}
                        >
                            <div className="conversation-header">
                                <span>{convo.eleve_prenom} {convo.eleve_nom} ({convo.eleve_classe.toUpperCase()})</span>
                                {convo.non_lus_enseignant > 0 && <span className="unread-badge">{convo.non_lus_enseignant}</span>}
                            </div>
                            {convo.dernier_message_contenu && (
                                <div className="last-message">
                                    <span style={{ fontStyle: 'italic', opacity: 0.8, fontSize: '0.9em' }}>
                                        {convo.dernier_message_expediteur === 'enseignant' ? 'Vous: ' : ''}
                                        {convo.dernier_message_contenu.substring(0, 30)}{convo.dernier_message_contenu.length > 30 ? '...' : ''}
                                    </span>
                                    <span style={{ fontSize: '0.8em', opacity: 0.7 }}>
                                        {new Date(convo.dernier_message_date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="chat-area">
                    {selectedConversation ? (
                        <>
                            <div className="chat-header">
                                <h3>Discussion avec {selectedConversation.eleve_prenom} {selectedConversation.eleve_nom}</h3>
                            </div>
                            <div className="messages-list">
                                {isLoadingMessages && <p className="loading">Chargement des messages...</p>}
                                {!isLoadingMessages && messages.length === 0 && <p className="no-messages">Aucun message dans cette conversation.</p>}
                                {messages.map(msg => (
                                    <div key={msg.id} className={`message ${msg.expediteur === 'enseignant' ? 'sent' : 'received'}`}>
                                        <p className="message-content">{msg.contenu}</p>
                                        <span className="message-info">{new Date(msg.date_envoi).toLocaleString('fr-FR')}</span>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="message-form">
                                <input 
                                    type="text"
                                    className="message-input"
                                    value={newMessageContent}
                                    onChange={(e) => setNewMessageContent(e.target.value)}
                                    placeholder="Écrire un message..."
                                    disabled={isSendingMessage}
                                />
                                <button type="submit" className="btn-send" disabled={isSendingMessage || !newMessageContent.trim()}>
                                    {isSendingMessage ? 'Envoi...' : 'Envoyer'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="no-conversation-selected">
                            <p>Sélectionnez une conversation pour afficher les messages.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeacherMessages;
// --- END OF FILE app/frontend/src/pages/teacher/TeacherMessages.js ---
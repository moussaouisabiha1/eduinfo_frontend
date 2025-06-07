// --- START OF FILE app/frontend/src/pages/teacher/ManageGrades.js ---
import React, { useState, useEffect, useCallback } from 'react';
import { getNotes, createNote, updateNote, deleteNote, getEleves } from '../../api';
import './Teacher.css';

const CLASSES_CHOICES_BACKEND = [
    '1am1', '1am2', '1am3', '1am4', '1am5', '2am1', '2am2', '2am3', '2am4', '2am5',
    '3am1', '3am2', '3am3', '3am4', '3am5', '4am1', '4am2', '4am3', '4am4', '4am5',
];

function ManageGrades() {
    const [notes, setNotes] = useState([]);
    const [elevesList, setElevesList] = useState([]); // Pour le sélecteur d'élèves
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentNote, setCurrentNote] = useState({ id: null, eleve: '', note: '', commentaire: '' });

    const [filterClasse, setFilterClasse] = useState(''); // Pour filtrer les notes affichées par classe

    const fetchElevesList = useCallback(async () => { // Pour peupler le dropdown des élèves
        try {
            const response = await getEleves({}); // Récupérer tous les élèves
            setElevesList(response.data.sort((a,b) => a.nom.localeCompare(b.nom)));
        } catch (err) {
            console.error("Erreur fetchElevesList:", err.response?.data || err.message);
            setError("Impossible de charger la liste des élèves pour le formulaire.");
        }
    }, []);
    
    const fetchNotesData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const params = {};
            if (filterClasse) params.classe = filterClasse;
            const response = await getNotes(params);
            setNotes(response.data);
        } catch (err) {
            setError('Erreur lors de la récupération des notes.');
            console.error("Erreur fetchNotesData:", err.response?.data || err.message);
        }
        setIsLoading(false);
    }, [filterClasse]);

    useEffect(() => {
        fetchElevesList();
        fetchNotesData();
    }, [fetchElevesList, fetchNotesData]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentNote(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentNote.eleve) {
            setError("Veuillez sélectionner un élève.");
            return;
        }
        const noteValue = parseFloat(currentNote.note);
        if (isNaN(noteValue) || noteValue < 0 || noteValue > 20) {
            setError("La note doit être un nombre valide entre 0 et 20.");
            return;
        }

        setIsLoading(true);
        setError('');
        const dataToSend = {
            eleve: currentNote.eleve, // C'est l'ID de l'élève
            note: noteValue.toFixed(2),
            commentaire: currentNote.commentaire.trim(),
        };

        try {
            if (isEditing) {
                await updateNote(currentNote.id, dataToSend);
            } else {
                await createNote(dataToSend);
            }
            resetFormAndFetch();
        } catch (err) {
            setError(err.response?.data?.detail || (isEditing ? 'Erreur lors de la modification de la note.' : 'Erreur lors de l\'ajout de la note.'));
            console.error("Erreur handleSubmit Note:", err.response?.data || err.message);
        }
        setIsLoading(false);
    };
    
    const resetFormAndFetch = () => {
        setShowForm(false);
        setIsEditing(false);
        setCurrentNote({ id: null, eleve: '', note: '', commentaire: '' });
        fetchNotesData();
    }

    const handleEdit = (noteObj) => {
        setCurrentNote({
            id: noteObj.id,
            eleve: noteObj.eleve, // C'est l'ID de l'élève
            note: noteObj.note,
            commentaire: noteObj.commentaire || ''
        });
        setIsEditing(true);
        setShowForm(true);
        setError('');
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
            setIsLoading(true);
            setError('');
            try {
                await deleteNote(id);
                fetchNotesData();
            } catch (err) {
                setError('Erreur lors de la suppression de la note.');
                console.error("Erreur handleDelete Note:", err.response?.data || err.message);
            }
            setIsLoading(false);
        }
    };
    
    const openAddForm = () => {
        setIsEditing(false);
        setCurrentNote({ id: null, eleve: '', note: '', commentaire: '' });
        setShowForm(true);
        setError('');
    };

    // Calcul des statistiques pour la classe sélectionnée (optionnel)
    const getClassStats = () => {
        if (!notes || notes.length === 0) return { moyenne: 0, reussis: 0, echecs: 0, total: 0 };
        const notesFiltrees = filterClasse ? notes.filter(n => n.eleve_details?.classe === filterClasse) : notes;
        if(notesFiltrees.length === 0) return { moyenne: 0, reussis: 0, echecs: 0, total: 0 };

        const totalNotes = notesFiltrees.reduce((sum, n) => sum + parseFloat(n.note), 0);
        const moyenne = totalNotes / notesFiltrees.length;
        const reussis = notesFiltrees.filter(n => parseFloat(n.note) >= 10).length;
        const echecs = notesFiltrees.length - reussis;
        return {
            moyenne: moyenne.toFixed(2),
            reussis,
            echecs,
            total: notesFiltrees.length,
        };
    };
    const stats = getClassStats();


    return (
        <div className="section-content">
            <div className="section-header">
                <h2>Gestion des Notes Générales</h2>
                <button onClick={openAddForm} className="btn-primary">
                    <span className="menu-icon" style={{marginRight: '5px'}}>➕</span> Ajouter une note
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="add-form" style={{marginBottom: '2rem'}}>
                    <h3>{isEditing ? "Modifier la note" : "Ajouter une nouvelle note"}</h3>
                    <div className="form-group">
                        <label htmlFor="eleve_note_form">Élève</label>
                        <select 
                            id="eleve_note_form" 
                            name="eleve" 
                            value={currentNote.eleve} 
                            onChange={handleInputChange}
                            required
                            disabled={elevesList.length === 0}
                        >
                            <option value="">-- Sélectionner un élève --</option>
                            {elevesList.map(el => (
                                <option key={el.id} value={el.id}>{el.prenom} {el.nom} ({el.classe.toUpperCase()})</option>
                            ))}
                        </select>
                         {elevesList.length === 0 && <p>Chargement des élèves ou aucun élève disponible...</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="note_val_form">Note (/20)</label>
                        <input type="number" id="note_val_form" name="note" value={currentNote.note} onChange={handleInputChange} step="0.25" min="0" max="20" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="commentaire_note_form">Commentaire (optionnel)</label>
                        <textarea id="commentaire_note_form" name="commentaire" value={currentNote.commentaire} onChange={handleInputChange} rows="3"></textarea>
                    </div>
                    {error && <p className="error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button type="submit" className="btn-success" disabled={isLoading || elevesList.length === 0}>
                            {isLoading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Ajouter')}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => {setShowForm(false); setError('');}}>Annuler</button>
                    </div>
                </form>
            )}

            <div className="filters class-selector" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                 <label htmlFor="filter_classe_notes" style={{whiteSpace: 'nowrap'}}>Filtrer par classe :</label>
                <select
                    id="filter_classe_notes"
                    className="class-select filter-select"
                    value={filterClasse}
                    onChange={(e) => setFilterClasse(e.target.value)}
                >
                    <option value="">Toutes les classes</option>
                    {CLASSES_CHOICES_BACKEND.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
            </div>
            
            {filterClasse && (
                 <div className="class-stats" style={{marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px'}}>
                    <h4>Statistiques pour la classe {filterClasse.toUpperCase()}</h4>
                    {stats.total > 0 ? (
                        <div className="stats-summary" style={{display: 'flex', gap: '1.5rem', justifyContent: 'space-around'}}>
                            <div className="stat-item">Moyenne: <span className="stat-value">{stats.moyenne}/20</span></div>
                            <div className="stat-item">Réussis (>=10): <span className="stat-value success-count">{stats.reussis}</span></div>
                            <div className="stat-item">Échecs (&lt;10): <span className="stat-value fail-count">{stats.echecs}</span></div>
                            <div className="stat-item">Total Notes: <span className="stat-value total-count">{stats.total}</span></div>
                        </div>
                    ) : (
                        <p>Aucune note enregistrée pour cette classe.</p>
                    )}
                </div>
            )}


            {isLoading && !notes.length && <p className="loading">Chargement des notes...</p>}
            
            <div className="grades-table">
                <table>
                    <thead>
                        <tr>
                            <th>Élève</th>
                            <th>Classe</th>
                            <th>Note (/20)</th>
                            <th>Commentaire</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notes.length > 0 ? notes.map(n => (
                            <tr key={n.id}>
                                <td>{n.eleve_details?.prenom} {n.eleve_details?.nom || 'N/A'}</td>
                                <td>{n.eleve_details?.classe?.toUpperCase() || 'N/A'}</td>
                                <td className={parseFloat(n.note) >= 10 ? 'success-count' : 'fail-count'}>{n.note}</td>
                                <td>{n.commentaire || '-'}</td>
                                <td>{new Date(n.date_attribution).toLocaleDateString('fr-FR')}</td>
                                <td>
                                    <button onClick={() => handleEdit(n)} className="btn-secondary btn-small">Modifier</button>
                                    <button onClick={() => handleDelete(n.id)} className="btn-danger btn-small" style={{marginLeft: '5px'}}>Supprimer</button>
                                </td>
                            </tr>
                        )) : (
                            !isLoading && <tr><td colSpan="6" className="no-data">Aucune note trouvée.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManageGrades;
// --- END OF FILE app/frontend/src/pages/teacher/ManageGrades.js ---
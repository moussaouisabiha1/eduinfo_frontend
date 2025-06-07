// --- START OF FILE app/frontend/src/pages/teacher/ManageExercises.js ---
import React, { useState, useEffect, useCallback } from 'react';
import { getAllExercices, createExercice, updateExercice, deleteExercice, getExerciceResponsesForTeacher, gradeExerciceResponse } from '../../api';
import './Teacher.css';

const CLASSES_CHOICES_BACKEND = [
    '1am1', '1am2', '1am3', '1am4', '1am5', '2am1', '2am2', '2am3', '2am4', '2am5',
    '3am1', '3am2', '3am3', '3am4', '3am5', '4am1', '4am2', '4am3', '4am4', '4am5',
];

function ManageExercises() {
    const [exercices, setExercices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentExercice, setCurrentExercice] = useState({ id: null, titre: '', enonce: '', classes_cibles: [] });

    const [selectedExerciceForResponses, setSelectedExerciceForResponses] = useState(null);
    const [exerciceResponses, setExerciceResponses] = useState([]);
    const [isLoadingResponses, setIsLoadingResponses] = useState(false);
    const [editingGrade, setEditingGrade] = useState({ responseId: null, note: '' });

    const fetchExercicesData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await getAllExercices();
            setExercices(response.data);
        } catch (err) {
            setError('Erreur lors de la récupération des exercices.');
            console.error("Erreur fetchExercicesData:", err.response?.data || err.message);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchExercicesData();
    }, [fetchExercicesData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentExercice(prev => ({ ...prev, [name]: value }));
    };
    
    const handleClassCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setCurrentExercice(prev => {
            const newClasses = [...prev.classes_cibles];
            if (checked) {
                if (!newClasses.includes(value)) newClasses.push(value);
            } else {
                const index = newClasses.indexOf(value);
                if (index > -1) newClasses.splice(index, 1);
            }
            return { ...prev, classes_cibles: newClasses };
        });
    };
    const handleSelectAllClasses = () => setCurrentExercice(prev => ({ ...prev, classes_cibles: ['all'] }));
    const handleClearAllClasses = () => setCurrentExercice(prev => ({ ...prev, classes_cibles: [] }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentExercice.titre.trim() || !currentExercice.enonce.trim()) {
            setError("Le titre et l'énoncé sont requis.");
            return;
        }
        if (currentExercice.classes_cibles.length === 0) {
            setError("Veuillez sélectionner au moins une classe cible ou 'Toutes les classes'.");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const dataToSend = {
                titre: currentExercice.titre,
                enonce: currentExercice.enonce,
                classes_cibles: currentExercice.classes_cibles.join(','),
            };
            if (isEditing) {
                await updateExercice(currentExercice.id, dataToSend);
            } else {
                await createExercice(dataToSend);
            }
            resetFormAndFetch();
        } catch (err) {
            setError(err.response?.data?.detail || (isEditing ? 'Erreur modification.' : 'Erreur ajout.'));
            console.error("Erreur handleSubmit Exercice:", err.response?.data || err.message);
        }
        setIsLoading(false);
    };

    const resetFormAndFetch = () => {
        setShowForm(false);
        setIsEditing(false);
        setCurrentExercice({ id: null, titre: '', enonce: '', classes_cibles: [] });
        fetchExercicesData();
    };

    const handleEdit = (exercice) => {
        setCurrentExercice({
            id: exercice.id,
            titre: exercice.titre,
            enonce: exercice.enonce,
            classes_cibles: exercice.classes_cibles ? exercice.classes_cibles.split(',').map(c => c.trim()) : []
        });
        setIsEditing(true);
        setShowForm(true);
        setError('');
        setSelectedExerciceForResponses(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cet exercice ?")) {
            setIsLoading(true);
            setError('');
            try {
                await deleteExercice(id);
                fetchExercicesData();
                if (selectedExerciceForResponses?.id === id) {
                    setSelectedExerciceForResponses(null);
                }
            } catch (err) {
                setError('Erreur de suppression.');
                console.error("Erreur handleDelete Exercice:", err.response?.data || err.message);
            }
            setIsLoading(false);
        }
    };
    
    const openAddForm = () => {
        setIsEditing(false);
        setCurrentExercice({ id: null, titre: '', enonce: '', classes_cibles: [] });
        setShowForm(true);
        setError('');
        setSelectedExerciceForResponses(null);
    };

    const handleViewResponses = async (exercice) => {
        setSelectedExerciceForResponses(exercice);
        setIsLoadingResponses(true);
        setExerciceResponses([]);
        try {
            const response = await getExerciceResponsesForTeacher(exercice.id);
            setExerciceResponses(response.data);
        } catch (err) {
            setError(`Erreur chargement réponses pour ${exercice.titre}.`);
            console.error("Erreur handleViewResponses:", err.response?.data || err.message);
        }
        setIsLoadingResponses(false);
    };

    const handleGradeChange = (responseId, newNote) => {
        setEditingGrade({ responseId, note: newNote });
    };

    const submitGrade = async (responseId) => {
        const responseToGrade = exerciceResponses.find(r => r.id === responseId);
        if (!responseToGrade) return;

        const noteValue = parseFloat(editingGrade.note);
        if (isNaN(noteValue) || noteValue < 0 || noteValue > 20) { // Adapter la validation de la note
            alert("La note doit être un nombre entre 0 et 20.");
            return;
        }
        
        setIsLoadingResponses(true); // Peut-être un loader spécifique pour la notation
        try {
            await gradeExerciceResponse(responseId, { note: noteValue.toFixed(2), corrigee: true });
            // Recharger les réponses pour cet exercice pour voir la mise à jour
            const updatedResponses = await getExerciceResponsesForTeacher(selectedExerciceForResponses.id);
            setExerciceResponses(updatedResponses.data);
            setEditingGrade({ responseId: null, note: '' }); // Reset editing state
        } catch (err) {
            alert('Erreur lors de la notation.');
            console.error("Erreur submitGrade:", err.response?.data || err.message);
        }
        setIsLoadingResponses(false);
    };

    return (
        <div className="section-content">
            <div className="section-header">
                <h2>Gestion des Exercices</h2>
                <button onClick={openAddForm} className="btn-primary">
                    <span className="menu-icon" style={{marginRight: '5px'}}>➕</span> Ajouter un exercice
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="add-form" style={{marginBottom: '2rem'}}>
                    <h3>{isEditing ? "Modifier l'exercice" : "Ajouter un exercice"}</h3>
                    <div className="form-group">
                        <label htmlFor="titre_exercice_form">Titre</label>
                        <input type="text" id="titre_exercice_form" name="titre" value={currentExercice.titre} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="enonce_exercice_form">Énoncé de l'exercice</label>
                        <textarea id="enonce_exercice_form" name="enonce" value={currentExercice.enonce} onChange={handleInputChange} rows="6" required></textarea>
                    </div>
                    <div className="form-group class-selection">
                        <h4>Classes Cibles</h4>
                        <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                            <button type="button" className="btn-small btn-secondary" onClick={handleSelectAllClasses}>Toutes (All)</button>
                            <button type="button" className="btn-small btn-secondary" onClick={handleClearAllClasses}>Effacer</button>
                        </div>
                        <div className="classes-grid">
                            {CLASSES_CHOICES_BACKEND.map(classe => (
                                <label key={classe} className="class-checkbox">
                                    <input type="checkbox" value={classe} checked={currentExercice.classes_cibles.includes(classe) || currentExercice.classes_cibles.includes('all')} onChange={handleClassCheckboxChange} disabled={currentExercice.classes_cibles.includes('all') && classe !== 'all'}/>
                                    {classe.toUpperCase()}
                                </label>
                            ))}
                            <label key="all" className="class-checkbox">
                                <input type="checkbox" value="all" checked={currentExercice.classes_cibles.includes('all')} onChange={(e) => e.target.checked ? handleSelectAllClasses() : handleClearAllClasses()} />
                                TOUTES (ALL)
                            </label>
                        </div>
                    </div>
                    {error && <p className="error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                     <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button type="submit" className="btn-success" disabled={isLoading}>{isLoading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Ajouter')}</button>
                        <button type="button" className="btn-secondary" onClick={() => {setShowForm(false); setError('');}}>Annuler</button>
                    </div>
                </form>
            )}

            {isLoading && !exercices.length && <p className="loading">Chargement des exercices...</p>}

            <div className="exercises-container"> {/* S'adapte au layout CSS */}
                <div className="exercises-list">
                    {exercices.length > 0 ? exercices.map(ex => (
                        <div key={ex.id} className={`exercise-card ${selectedExerciceForResponses?.id === ex.id ? 'selected' : ''}`}>
                            <div className="exercise-header">
                                <h4>{ex.titre}</h4>
                                <p className="exercise-info">Classes: {ex.classes_cibles.toUpperCase()}</p>
                            </div>
                            <p>{ex.enonce.substring(0,150)}{ex.enonce.length > 150 ? '...' : ''}</p>
                            <div className="file-actions" style={{marginTop: '10px'}}>
                                <button onClick={() => handleViewResponses(ex)} className="btn-primary btn-small">Voir Réponses</button>
                                <button onClick={() => handleEdit(ex)} className="btn-secondary btn-small" style={{marginLeft: '5px'}}>Modifier</button>
                                <button onClick={() => handleDelete(ex.id)} className="btn-danger btn-small" style={{marginLeft: '5px'}}>Supprimer</button>
                            </div>
                        </div>
                    )) : (
                         !isLoading && <p className="no-data">Aucun exercice créé.</p>
                    )}
                </div>

                {selectedExerciceForResponses && (
                    <div className="exercise-responses">
                        <h3>Réponses pour : {selectedExerciceForResponses.titre}</h3>
                        {isLoadingResponses && <p className="loading">Chargement des réponses...</p>}
                        {!isLoadingResponses && exerciceResponses.length === 0 && <p className="no-data">Aucune réponse soumise pour cet exercice.</p>}
                        {!isLoadingResponses && exerciceResponses.length > 0 && (
                            <div className="responses-list">
                                {exerciceResponses.map(resp => (
                                    <div key={resp.id} className="response-item">
                                        <div>
                                            <strong>{resp.eleve_prenom} {resp.eleve_nom} ({resp.eleve_classe.toUpperCase()})</strong>
                                            <p>Réponse: {resp.reponse}</p>
                                            <p>Soumis le: {new Date(resp.date_soumission).toLocaleString('fr-FR')}</p>
                                        </div>
                                        <div style={{textAlign: 'right'}}>
                                            {resp.corrigee ? (
                                                <p>Note: <strong>{resp.note}/20</strong></p>
                                            ) : (
                                                <p style={{color: 'orange'}}>Non corrigé</p>
                                            )}
                                            <input 
                                                type="number"
                                                step="0.25"
                                                min="0"
                                                max="20"
                                                className="grade-input"
                                                placeholder="Note/20"
                                                value={editingGrade.responseId === resp.id ? editingGrade.note : (resp.note || '')}
                                                onChange={(e) => handleGradeChange(resp.id, e.target.value)}
                                                onFocus={() => setEditingGrade({responseId: resp.id, note: resp.note || ''})}
                                            />
                                            <button 
                                                onClick={() => submitGrade(resp.id)} 
                                                className="btn-success btn-small"
                                                style={{marginLeft: '5px'}}
                                                disabled={editingGrade.responseId === resp.id && (editingGrade.note === '' || isNaN(parseFloat(editingGrade.note)))}
                                            >
                                                Noter
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => setSelectedExerciceForResponses(null)} className="btn-secondary" style={{marginTop: '1rem'}}>Fermer Réponses</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageExercises;
// --- END OF FILE app/frontend/src/pages/teacher/ManageExercises.js ---
// --- START OF FILE app/frontend/src/pages/teacher/ManageActivities.js ---
import React, { useState, useEffect, useCallback } from 'react';
import { getAllActivites, createActivite, updateActivite, deleteActivite, getActivityProgress } from '../../api';
import './Teacher.css';

const CLASSES_CHOICES_BACKEND = [
    '1am1', '1am2', '1am3', '1am4', '1am5', '2am1', '2am2', '2am3', '2am4', '2am5',
    '3am1', '3am2', '3am3', '3am4', '3am5', '4am1', '4am2', '4am3', '4am4', '4am5',
];

function ManageActivities() {
    const [activites, setActivites] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentActivite, setCurrentActivite] = useState({ id: null, titre: '', description: '', fichier_joint: null, classes_cibles: [] });
    const [filePreview, setFilePreview] = useState('');

    const [selectedActivityForProgress, setSelectedActivityForProgress] = useState(null);
    const [activityProgress, setActivityProgress] = useState([]);
    const [isLoadingProgress, setIsLoadingProgress] = useState(false);

    const fetchActivitesData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await getAllActivites();
            setActivites(response.data);
        } catch (err) {
            setError('Erreur lors de la récupération des activités.');
            console.error("Erreur fetchActivitesData:", err.response?.data || err.message);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchActivitesData();
    }, [fetchActivitesData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentActivite(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCurrentActivite(prev => ({ ...prev, fichier_joint: file }));
            setFilePreview(file.name);
        } else {
            setCurrentActivite(prev => ({ ...prev, fichier_joint: null }));
            setFilePreview('');
        }
    };
    
    const handleClassCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setCurrentActivite(prev => {
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
     const handleSelectAllClasses = () => setCurrentActivite(prev => ({ ...prev, classes_cibles: ['all'] }));
     const handleClearAllClasses = () => setCurrentActivite(prev => ({ ...prev, classes_cibles: [] }));


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentActivite.titre.trim() || !currentActivite.description.trim()) {
            setError("Le titre et la description sont requis.");
            return;
        }
        if (currentActivite.classes_cibles.length === 0) {
            setError("Veuillez sélectionner au moins une classe cible ou 'Toutes les classes'.");
            return;
        }

        setIsLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('titre', currentActivite.titre);
        formData.append('description', currentActivite.description);
        if (currentActivite.fichier_joint instanceof File) {
            formData.append('fichier_joint', currentActivite.fichier_joint);
        }
        formData.append('classes_cibles', currentActivite.classes_cibles.join(','));

        try {
            if (isEditing) {
                await updateActivite(currentActivite.id, formData);
            } else {
                await createActivite(formData);
            }
            resetFormAndFetch();
        } catch (err) {
            setError(err.response?.data?.detail || (isEditing ? 'Erreur modification.' : 'Erreur ajout.'));
            console.error("Erreur handleSubmit Activite:", err.response?.data || err.message);
        }
        setIsLoading(false);
    };
    
    const resetFormAndFetch = () => {
        setShowForm(false);
        setIsEditing(false);
        setCurrentActivite({ id: null, titre: '', description: '', fichier_joint: null, classes_cibles: [] });
        setFilePreview('');
        fetchActivitesData();
    };

    const handleEdit = (activite) => {
        setCurrentActivite({
            id: activite.id,
            titre: activite.titre,
            description: activite.description,
            fichier_joint: null,
            classes_cibles: activite.classes_cibles ? activite.classes_cibles.split(',').map(c => c.trim()) : []
        });
        setFilePreview(activite.fichier_joint ? activite.fichier_joint.split('/').pop() : '');
        setIsEditing(true);
        setShowForm(true);
        setError('');
        setSelectedActivityForProgress(null); // Cacher la vue de progression si elle était ouverte
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cette activité ?")) {
            setIsLoading(true);
            setError('');
            try {
                await deleteActivite(id);
                fetchActivitesData();
                if (selectedActivityForProgress && selectedActivityForProgress.id === id) {
                    setSelectedActivityForProgress(null); // Cacher la progression si l'activité supprimée était sélectionnée
                }
            } catch (err) {
                setError('Erreur de suppression.');
                console.error("Erreur handleDelete Activite:", err.response?.data || err.message);
            }
            setIsLoading(false);
        }
    };

    const handleViewProgress = async (activite) => {
        setSelectedActivityForProgress(activite);
        setIsLoadingProgress(true);
        setActivityProgress([]);
        try {
            const response = await getActivityProgress(activite.id);
            setActivityProgress(response.data);
        } catch (err) {
            setError(`Erreur chargement progression pour ${activite.titre}.`);
            console.error("Erreur handleViewProgress:", err.response?.data || err.message);
        }
        setIsLoadingProgress(false);
    };
    
    const openAddForm = () => {
        setIsEditing(false);
        setCurrentActivite({ id: null, titre: '', description: '', fichier_joint: null, classes_cibles: [] });
        setFilePreview('');
        setShowForm(true);
        setError('');
        setSelectedActivityForProgress(null);
    };

    return (
        <div className="section-content">
            <div className="section-header">
                <h2>Gestion des Activités</h2>
                <button onClick={openAddForm} className="btn-primary">
                     <span className="menu-icon" style={{marginRight: '5px'}}>➕</span> Ajouter une activité
                </button>
            </div>

            {showForm && (
                 <form onSubmit={handleSubmit} className="add-form" encType="multipart/form-data" style={{marginBottom: '2rem'}}>
                    <h3>{isEditing ? "Modifier l'activité" : "Ajouter une activité"}</h3>
                    <div className="form-group">
                        <label htmlFor="titre_activite_form">Titre</label>
                        <input type="text" id="titre_activite_form" name="titre" value={currentActivite.titre} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description_activite_form">Description</label>
                        <textarea id="description_activite_form" name="description" value={currentActivite.description} onChange={handleInputChange} rows="4" required></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="fichier_activite_form">Fichier joint (optionnel) {isEditing && currentActivite.fichier_joint && "(laisser vide pour ne pas changer)"}</label>
                        <input type="file" id="fichier_activite_form" name="fichier_joint" onChange={handleFileChange} />
                        {filePreview && <p style={{marginTop: '5px', fontSize: '0.9em'}}>Fichier: {filePreview}</p>}
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
                                    <input type="checkbox" value={classe} checked={currentActivite.classes_cibles.includes(classe) || currentActivite.classes_cibles.includes('all')} onChange={handleClassCheckboxChange} disabled={currentActivite.classes_cibles.includes('all') && classe !== 'all'} />
                                    {classe.toUpperCase()}
                                </label>
                            ))}
                            <label key="all" className="class-checkbox">
                                <input type="checkbox" value="all" checked={currentActivite.classes_cibles.includes('all')} onChange={(e) => e.target.checked ? handleSelectAllClasses() : handleClearAllClasses()} />
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
            
            {isLoading && !activites.length && <p className="loading">Chargement des activités...</p>}

            <div className="activities-container"> {/* Ou activities-list selon ton CSS */}
                <div className="activities-list">
                    {activites.length > 0 ? activites.map(act => (
                        <div key={act.id} className={`activity-card ${selectedActivityForProgress?.id === act.id ? 'selected' : ''}`}>
                            <div className="activity-header">
                                <h4>{act.titre}</h4>
                                <p className="activity-info">Classes: {act.classes_cibles.toUpperCase()}</p>
                            </div>
                            <p>{act.description.substring(0,100)}{act.description.length > 100 ? '...' : ''}</p>
                            {act.fichier_joint && <a href={act.fichier_joint} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-small">Voir Fichier Joint</a>}
                            <div className="file-actions" style={{marginTop: '10px'}}>
                                <button onClick={() => handleViewProgress(act)} className="btn-primary btn-small">Voir Progression</button>
                                <button onClick={() => handleEdit(act)} className="btn-secondary btn-small" style={{marginLeft: '5px'}}>Modifier</button>
                                <button onClick={() => handleDelete(act.id)} className="btn-danger btn-small" style={{marginLeft: '5px'}}>Supprimer</button>
                            </div>
                        </div>
                    )) : (
                        !isLoading && <p className="no-data">Aucune activité créée pour le moment.</p>
                    )}
                </div>

                {selectedActivityForProgress && (
                    <div className="activity-details"> {/* activity-details ou students-progress */}
                        <h3>Progression pour : {selectedActivityForProgress.titre}</h3>
                        {isLoadingProgress && <p className="loading">Chargement de la progression...</p>}
                        {!isLoadingProgress && activityProgress.length === 0 && <p className="no-data">Aucun élève concerné ou aucune progression enregistrée.</p>}
                        {!isLoadingProgress && activityProgress.length > 0 && (
                            <div className="students-progress">
                                {activityProgress.map(prog => (
                                    <div key={prog.eleve_id} className="student-progress">
                                        <span>{prog.eleve_prenom} {prog.eleve_nom} ({prog.eleve_classe.toUpperCase()})</span>
                                        <span className={`status ${prog.completee ? 'completed' : 'pending'}`}>
                                            {prog.completee ? 'Complétée' : 'En attente'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                         <button onClick={() => setSelectedActivityForProgress(null)} className="btn-secondary" style={{marginTop: '1rem'}}>Fermer Progression</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageActivities;
// --- END OF FILE app/frontend/src/pages/teacher/ManageActivities.js ---
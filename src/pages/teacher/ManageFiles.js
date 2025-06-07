// --- START OF FILE app/frontend/src/pages/teacher/ManageFiles.js ---
import React, { useState, useEffect, useCallback } from 'react';
import { getAllFichiers, createFichier, deleteFichier, updateFichier } from '../../api';
import './Teacher.css'; // Votre CSS

const CLASSES_CHOICES_BACKEND = [
    '1am1', '1am2', '1am3', '1am4', '1am5', '2am1', '2am2', '2am3', '2am4', '2am5',
    '3am1', '3am2', '3am3', '3am4', '3am5', '4am1', '4am2', '4am3', '4am4', '4am5',
];

function ManageFiles() {
    const [fichiers, setFichiers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFichier, setCurrentFichier] = useState({ id: null, titre: '', fichier: null, classes_cibles: [] });
    const [filePreview, setFilePreview] = useState(''); // Pour prévisualiser le nom du fichier sélectionné

    const fetchFichiersData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await getAllFichiers();
            setFichiers(response.data);
        } catch (err) {
            setError('Erreur lors de la récupération des fichiers.');
            console.error("Erreur fetchFichiersData:", err.response?.data || err.message);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchFichiersData();
    }, [fetchFichiersData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentFichier(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCurrentFichier(prev => ({ ...prev, fichier: file }));
            setFilePreview(file.name);
        } else {
            setCurrentFichier(prev => ({ ...prev, fichier: null }));
            setFilePreview('');
        }
    };

    const handleClassCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setCurrentFichier(prev => {
            const newClasses = [...prev.classes_cibles];
            if (checked) {
                if (!newClasses.includes(value)) {
                    newClasses.push(value);
                }
            } else {
                const index = newClasses.indexOf(value);
                if (index > -1) {
                    newClasses.splice(index, 1);
                }
            }
            return { ...prev, classes_cibles: newClasses };
        });
    };
    
    const handleSelectAllClasses = () => {
        setCurrentFichier(prev => ({ ...prev, classes_cibles: ['all'] }));
    };

    const handleClearAllClasses = () => {
        setCurrentFichier(prev => ({ ...prev, classes_cibles: [] }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentFichier.titre.trim()) {
            setError("Le titre est requis.");
            return;
        }
        if (!isEditing && !currentFichier.fichier) {
            setError("Un fichier est requis pour un nouvel ajout.");
            return;
        }
        if (currentFichier.classes_cibles.length === 0) {
            setError("Veuillez sélectionner au moins une classe cible ou 'Toutes les classes'.");
            return;
        }

        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('titre', currentFichier.titre);
        // Pour la modification, le fichier n'est pas toujours renvoyé s'il n'est pas changé
        if (currentFichier.fichier instanceof File) {
            formData.append('fichier', currentFichier.fichier);
        }
        formData.append('classes_cibles', currentFichier.classes_cibles.join(','));

        try {
            if (isEditing) {
                await updateFichier(currentFichier.id, formData);
            } else {
                await createFichier(formData);
            }
            resetFormAndFetch();
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.fichier?.[0] || (isEditing ? 'Erreur lors de la modification.' : 'Erreur lors de l\'ajout.'));
            console.error("Erreur handleSubmit Fichier:", err.response?.data || err.message);
        }
        setIsLoading(false);
    };

    const resetFormAndFetch = () => {
        setShowForm(false);
        setIsEditing(false);
        setCurrentFichier({ id: null, titre: '', fichier: null, classes_cibles: [] });
        setFilePreview('');
        fetchFichiersData();
    };

    const handleEdit = (fichier) => {
        setCurrentFichier({
            id: fichier.id,
            titre: fichier.titre,
            fichier: null, // On ne recharge pas le fichier existant, l'utilisateur peut en choisir un nouveau s'il veut remplacer
            classes_cibles: fichier.classes_cibles ? fichier.classes_cibles.split(',').map(c => c.trim()) : []
        });
        setFilePreview(fichier.fichier.split('/').pop()); // Affiche le nom du fichier actuel
        setIsEditing(true);
        setShowForm(true);
        setError('');
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
            setIsLoading(true);
            setError('');
            try {
                await deleteFichier(id);
                fetchFichiersData();
            } catch (err) {
                setError('Erreur lors de la suppression.');
                console.error("Erreur handleDelete Fichier:", err.response?.data || err.message);
            }
            setIsLoading(false);
        }
    };
    
    const openAddForm = () => {
        setIsEditing(false);
        setCurrentFichier({ id: null, titre: '', fichier: null, classes_cibles: [] });
        setFilePreview('');
        setShowForm(true);
        setError('');
    };

    return (
        <div className="section-content">
            <div className="section-header">
                <h2>Gestion des Fichiers Partagés</h2>
                <button onClick={openAddForm} className="btn-primary">
                    <span className="menu-icon" style={{marginRight: '5px'}}>➕</span> Ajouter un fichier
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="add-form" encType="multipart/form-data" style={{marginBottom: '2rem'}}>
                    <h3>{isEditing ? "Modifier le fichier" : "Ajouter un nouveau fichier"}</h3>
                    <div className="form-group">
                        <label htmlFor="titre_fichier_form">Titre du fichier</label>
                        <input type="text" id="titre_fichier_form" name="titre" value={currentFichier.titre} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fichier_input_form">Fichier {isEditing && "(laisser vide pour ne pas changer)"}</label>
                        <input type="file" id="fichier_input_form" name="fichier" onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.png,.zip,.rar" />
                        {filePreview && <p style={{marginTop: '5px', fontSize: '0.9em'}}>Fichier sélectionné : {filePreview}</p>}
                    </div>
                    
                    <div className="form-group class-selection">
                        <h4>Classes Cibles</h4>
                        <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                            <button type="button" className="btn-small btn-secondary" onClick={handleSelectAllClasses}>
                                Toutes les classes (All)
                            </button>
                            <button type="button" className="btn-small btn-secondary" onClick={handleClearAllClasses}>
                                Effacer sélection
                            </button>
                        </div>
                        <div className="classes-grid">
                            {CLASSES_CHOICES_BACKEND.map(classe => (
                                <label key={classe} className="class-checkbox">
                                    <input
                                        type="checkbox"
                                        value={classe}
                                        checked={currentFichier.classes_cibles.includes(classe) || currentFichier.classes_cibles.includes('all')}
                                        onChange={handleClassCheckboxChange}
                                        disabled={currentFichier.classes_cibles.includes('all') && classe !== 'all'}
                                    />
                                    {classe.toUpperCase()}
                                </label>
                            ))}
                             <label key="all" className="class-checkbox"> {/* Option "all" explicite */}
                                <input
                                    type="checkbox"
                                    value="all"
                                    checked={currentFichier.classes_cibles.includes('all')}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            handleSelectAllClasses();
                                        } else {
                                            handleClearAllClasses();
                                        }
                                    }}
                                />
                                TOUTES (ALL)
                            </label>
                        </div>
                    </div>

                    {error && <p className="error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button type="submit" className="btn-success" disabled={isLoading}>
                            {isLoading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Ajouter')}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => {setShowForm(false); setError('');}}>Annuler</button>
                    </div>
                </form>
            )}

            {isLoading && !fichiers.length && <p className="loading">Chargement des fichiers...</p>}
            
            <div className="files-list"> {/* Ou files-grid selon ton CSS */}
                {fichiers.length > 0 ? (
                    <div className="files-grid">
                        {fichiers.map(fichier => (
                            <div key={fichier.id} className="file-card">
                                <h4 className="file-name">{fichier.titre}</h4>
                                <p className="file-classes">
                                    Classes: {fichier.classes_cibles ? fichier.classes_cibles.toUpperCase() : 'N/A'}
                                </p>
                                <p className="file-date">
                                    Ajouté le: {new Date(fichier.date_upload).toLocaleDateString('fr-FR')}
                                </p>
                                <a href={fichier.fichier} target="_blank" rel="noopener noreferrer" className="btn-primary btn-small" style={{marginRight: '10px', textDecoration: 'none'}}>
                                    Voir/Télécharger
                                </a>
                                <div className="file-actions" style={{marginTop: '10px'}}>
                                    <button onClick={() => handleEdit(fichier)} className="btn-secondary btn-small">Modifier</button>
                                    <button onClick={() => handleDelete(fichier.id)} className="btn-danger btn-small" style={{marginLeft: '5px'}}>Supprimer</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !isLoading && <p className="no-data">Aucun fichier partagé pour le moment.</p>
                )}
            </div>
        </div>
    );
}

export default ManageFiles;
// --- END OF FILE app/frontend/src/pages/teacher/ManageFiles.js ---
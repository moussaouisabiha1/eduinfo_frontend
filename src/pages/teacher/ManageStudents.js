// --- START OF FILE app/frontend/src/pages/teacher/ManageStudents.js ---
import React, { useState, useEffect, useCallback } from 'react';
import { getEleves, createEleve, updateEleve, deleteEleve } from '../../api'; // Assure-toi que le chemin est correct
import './Teacher.css'; // Votre CSS

const CLASSES_CHOICES_BACKEND = [
    '1am1', '1am2', '1am3', '1am4', '1am5',
    '2am1', '2am2', '2am3', '2am4', '2am5',
    '3am1', '3am2', '3am3', '3am4', '3am5',
    '4am1', '4am2', '4am3', '4am4', '4am5',
];

function ManageStudents() {
    const [eleves, setEleves] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEleve, setCurrentEleve] = useState({ id: null, nom: '', prenom: '', classe: CLASSES_CHOICES_BACKEND[0] });

    const [filterClasse, setFilterClasse] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchElevesData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const params = {};
            if (filterClasse) params.classe = filterClasse;
            if (searchTerm) params.search = searchTerm;
            const response = await getEleves(params);
            setEleves(response.data);
        } catch (err) {
            setError('Erreur lors de la récupération des élèves. Vérifiez la console pour plus de détails.');
            console.error("Erreur fetchElevesData:", err.response?.data || err.message);
        }
        setIsLoading(false);
    }, [filterClasse, searchTerm]);

    useEffect(() => {
        fetchElevesData();
    }, [fetchElevesData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentEleve(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Dans le formulaire, 'nom' est pour le nom de famille (اللقب), 'prenom' pour le prénom (الاسم)
        if (!currentEleve.nom.trim() || !currentEleve.prenom.trim()) {
            setError("Le nom et le prénom sont requis.");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // Le backend attend 'nom' pour الاسم et 'prenom' pour اللقب.
            // Donc, ce qui est saisi dans le champ 'nom' du formulaire (اللقب) va à 'nom' dans l'API
            // et ce qui est saisi dans 'prenom' du formulaire (الاسم) va à 'prenom' dans l'API.
            // C'est un peu confus à cause des inversions de labels, mais la donnée envoyée est correcte
            // si le 'name' des inputs correspond aux clés attendues par le state `currentEleve`
            // et que `currentEleve` utilise 'nom' pour le nom de famille et 'prenom' pour le prénom.

            const dataToSend = {
                nom: currentEleve.nom, // Ce sera le champ "الاسم" dans le modèle Django
                prenom: currentEleve.prenom, // Ce sera le champ "اللقب" dans le modèle Django
                classe: currentEleve.classe
            };
            // Correction des noms de variables pour l'envoi si nécessaire, pour correspondre au backend.
            // Dans le backend : Eleve.nom = "الاسم", Eleve.prenom = "اللقب"
            // Dans le formulaire React, l'input pour "الاسم (Prénom)" a name="prenom"
            // Dans le formulaire React, l'input pour "اللقب (Nom)" a name="nom"
            // Donc, currentEleve.nom contient le nom de famille (اللقب) et currentEleve.prenom contient le prénom (الاسم)

            // Pour être TRÈS explicite et éviter la confusion avec le backend:
            const apiData = {
                nom: currentEleve.prenom, // Le prénom de l'élève (الاسم)
                prenom: currentEleve.nom,   // Le nom de famille de l'élève (اللقب)
                classe: currentEleve.classe
            };


            if (isEditing) {
                await updateEleve(currentEleve.id, apiData);
            } else {
                await createEleve(apiData);
            }
            resetFormAndFetch();
        } catch (err) {
            const backendError = err.response?.data;
            let displayErrorMessage = isEditing ? 'Erreur lors de la modification.' : 'Erreur lors de l\'ajout.';

            if (backendError && typeof backendError === 'object') {
                if (backendError.non_field_errors && Array.isArray(backendError.non_field_errors) && backendError.non_field_errors.length > 0) {
                    displayErrorMessage = backendError.non_field_errors[0];
                    if (typeof displayErrorMessage === 'string' && (displayErrorMessage.toLowerCase().includes("unique") || displayErrorMessage.toLowerCase().includes("already exists"))) {
                        displayErrorMessage = "Un élève avec ce nom, prénom et classe existe déjà.";
                    }
                } else {
                    const fieldErrors = Object.entries(backendError)
                        .map(([field, messages]) => {
                            // Afficher le nom du champ de manière plus lisible si possible
                            let readableField = field;
                            if (field === 'nom') readableField = 'الاسم (Prénom)';
                            if (field === 'prenom') readableField = 'اللقب (Nom)';
                            return `${readableField}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
                        })
                        .join('; ');
                    if (fieldErrors) {
                        displayErrorMessage = fieldErrors;
                         // Si une erreur de champ spécifique mentionne l'unicité
                        if (fieldErrors.toLowerCase().includes("unique") || fieldErrors.toLowerCase().includes("already exists")) {
                            displayErrorMessage = "Un élève avec ce nom, prénom et classe existe déjà.";
                        }
                    }
                }
            } else if (typeof backendError === 'string') {
                displayErrorMessage = backendError;
                 if (displayErrorMessage.toLowerCase().includes("unique") || displayErrorMessage.toLowerCase().includes("already exists")) {
                    displayErrorMessage = "Un élève avec ce nom, prénom et classe existe déjà.";
                }
            } else if (err.message) {
                 displayErrorMessage = err.message;
            }
            
            setError(displayErrorMessage);
            console.error("Erreur handleSubmit Eleve:", backendError || err.message);
        }
        setIsLoading(false);
    };
    
    const resetFormAndFetch = () => {
        setShowForm(false);
        setIsEditing(false);
        setCurrentEleve({ id: null, nom: '', prenom: '', classe: CLASSES_CHOICES_BACKEND[0] });
        fetchElevesData();
    };

    const handleEdit = (eleve) => {
        // Le backend retourne eleve.nom comme "الاسم" (prénom) et eleve.prenom comme "اللقب" (nom de famille)
        // Notre state currentEleve utilise 'nom' pour le nom de famille (اللقب) et 'prenom' pour le prénom (الاسم)
        setCurrentEleve({ 
            id: eleve.id, 
            nom: eleve.prenom,      // Backend prenom (اللقب) va dans state nom
            prenom: eleve.nom,    // Backend nom (الاسم) va dans state prenom
            classe: eleve.classe 
        });
        setIsEditing(true);
        setShowForm(true);
        setError('');
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible.")) {
            setIsLoading(true);
            setError('');
            try {
                await deleteEleve(id);
                fetchElevesData();
            } catch (err) {
                setError('Erreur lors de la suppression.');
                console.error("Erreur handleDelete Eleve:", err.response?.data || err.message);
            }
            setIsLoading(false);
        }
    };

    const openAddForm = () => {
        setCurrentEleve({ id: null, nom: '', prenom: '', classe: CLASSES_CHOICES_BACKEND[0] });
        setIsEditing(false);
        setShowForm(true);
        setError('');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="section-content">
            <div className="section-header no-print">
                <h2>Gestion des Élèves</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={handlePrint} className="btn-print">
                        🖨️ Imprimer la liste
                    </button>
                    <button onClick={openAddForm} className="btn-primary">
                        <span className="menu-icon" style={{marginRight: '5px'}}>➕</span> Ajouter un élève
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="add-form no-print" style={{marginBottom: '2rem'}}>
                    <h3>{isEditing ? "Modifier l'élève" : "Ajouter un nouvel élève"}</h3>
                    {/* Labels ajustés pour correspondre à l'utilisation dans le state et l'affichage de la table */}
                    {/* Le champ 'name' de l'input correspond à la clé dans currentEleve */}
                    <div className="form-group">
                        <label htmlFor="form_prenom_eleve">الاسم (Prénom)</label> 
                        <input type="text" id="form_prenom_eleve" name="prenom" value={currentEleve.prenom} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="form_nom_eleve">اللقب (Nom de famille)</label>
                        <input type="text" id="form_nom_eleve" name="nom" value={currentEleve.nom} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="form_classe_eleve">القسم (Classe)</label>
                        <select id="form_classe_eleve" name="classe" value={currentEleve.classe} onChange={handleInputChange}>
                            {CLASSES_CHOICES_BACKEND.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                        </select>
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

            <div className="filters no-print">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou prénom..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select
                        className="filter-select"
                        value={filterClasse}
                        onChange={(e) => setFilterClasse(e.target.value)}
                    >
                        <option value="">Toutes les classes</option>
                        {CLASSES_CHOICES_BACKEND.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            {isLoading && !eleves.length && <p className="loading no-print">Chargement des élèves...</p>}
            {error && !showForm && <p className="error no-print" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            
            <div className="students-table" id="students-list-print-area">
                <div className="print-only" style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 5px 0' }}>قائمة التلاميذ</h2>
                    {filterClasse && <h3 style={{ margin: '0 0 15px 0', fontWeight: 'normal' }}>القسم: {filterClasse.toUpperCase()}</h3>}
                    {!filterClasse && searchTerm && <h3 style={{ margin: '0 0 15px 0', fontWeight: 'normal' }}>بحث: "{searchTerm}"</h3>}
                </div>

                <table>
                    <thead>
                        <tr>
                        
                            <th>اللقب</th>
							<th>الاسم</th>
                            <th>القسم </th>
                            <th className="no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eleves.length > 0 ? eleves.map(eleve => (
                            // Dans la liste affichée, eleve.nom est الاسم (prénom) et eleve.prenom est اللقب (nom de famille)
                            // car c'est ce que le backend retourne.
                            <tr key={eleve.id}>
                                
                                <td>{eleve.prenom}</td> {/* Corresponds à "اللقب" du backend (nom de famille) */}
								<td>{eleve.nom}</td>    {/* Corresponds à "الاسم" du backend (prénom) */}
                                <td>{eleve.classe.toUpperCase()}</td>
                                <td className="no-print">
                                    <button onClick={() => handleEdit(eleve)} className="btn-secondary btn-small">تعديل</button>
                                    <button onClick={() => handleDelete(eleve.id)} className="btn-danger btn-small" style={{marginLeft: '5px'}}>حذف</button>
                                </td>
                            </tr>
                        )) : (
                            !isLoading && <tr><td colSpan={4} className="no-data no-print">Aucun élève trouvé pour les filtres actuels.</td></tr>
                        )}
                    </tbody>
                </table>
                <div className="print-only" style={{ marginTop: '30px', fontSize: '0.8em', color: '#555', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                   
                </div>
            </div>
        </div>
    );
}

export default ManageStudents;
// --- END OF FILE app/frontend/src/pages/teacher/ManageStudents.js ---
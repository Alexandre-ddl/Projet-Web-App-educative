
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.scss';

import { AdminService } from '../services/AdminService';
import { MyBlogContext } from '../MyBlogContext';
import { config } from "../config";

type PartiesData = {
  id_partie:number;
  nom: string;
  date_creation: string;
}

export function AdminPage() {
  const { admin } = useContext(MyBlogContext);
  const adminService = new AdminService(config.API_URL);
  const [nomPartie, setNomPartie] = useState('');
  const [nombreEquipes, setNombreEquipes] = useState<number|null>();
  const [demandesClient, setDemandesClient] = useState(Array(10).fill(''));
  const [filtreNom, setFiltreNom] = useState('');
  const [filtreDate, setFiltreDate] = useState('');
  const [parties, setParties] = useState<PartiesData[]>([]);
  const [messageSuccess, setMessageSuccess] = useState('');
  const [messageError, setMessageError] = useState('');
  const [partieCreee, setPartieCreee] = useState(false);

  const navigate = useNavigate();
    
  const partiesFiltrees = parties.filter(p => 
    p.nom.toLowerCase().includes(filtreNom.toLowerCase()) && 
    p.date_creation.includes(filtreDate) // Modifier ici pour utiliser date_creation au lieu de dateCreation
  );
  

  const handleDemandeChange = (index: number, value: string) => {
    const newDemandes = [...demandesClient];
    newDemandes[index] = value;
    setDemandesClient(newDemandes);

    // Ajouter 10 champs supplémentaires si le dernier champ est rempli
    if (index === demandesClient.length - 1 && value) {
      setDemandesClient([...newDemandes, ...Array(10).fill('')]);
    }
  };

  const redirectToPartie = (idPartie: number, NomPartie: string ) => {
    navigate(`/partie-equipes/${idPartie}/${NomPartie}`);
; 
  };
  const handleSubmit = async () => {
    setMessageSuccess('');
    setMessageError('');

    if (!nomPartie || !nombreEquipes) {
      setMessageError('Veuillez remplir les champs Nom de la partie et Nombre d\'équipes');
      return;
    }

    const demandesRemplies = demandesClient.map((demande, index) => demande || '10');
    for (let i = demandesRemplies.length; i < 100; i++) {
      demandesRemplies.push('10');
    }
    console.log('test')
    admin && adminService.createPartie(admin.admin, nomPartie, nombreEquipes, demandesRemplies)
      .then((response) => {
        // Vérifiez le statut dans la réponse de l'API
        if (response.data.status === "error") {
          // Si le statut est "error", affichez le message d'erreur.
          console.log("Erreur lors de la création de la partie:", response.data.message);
          setMessageError(response.data.message);
          setPartieCreee(false);
        } else {
          // Si le statut n'est pas "error", la partie a été créée avec succès.
          console.log("Partie créée avec succès:", response.data.message);
          setMessageSuccess(response.data.message);
          setPartieCreee(true); 
        }
      })
      .catch(error => {
        // Gestion des erreurs de requête HTTP
        console.error("Erreur HTTP:", error);
        setMessageError('Erreur lors de la création de la partie: ' + (error.response?.data?.message || error.message));
      });

  };

  useEffect(() => {

    admin && adminService.getAdminParties(admin.admin)
            .then((response) => {
                setParties(response.data.parties)
                setPartieCreee(false)
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des parties pour l'admin:", error);
            });   
    }, [admin,partieCreee]);

    const handleAdminClick = () => {
      navigate("/super-admin-page");
    };

  return (
    
    <div className="admin-page-container"> 
     {admin?.sup_admin && (  
      <button className="adminButtoneee" onClick={handleAdminClick}>Super Admin page</button>
     )}
      <div className="selection-partie">
        <h2 className="titre-selection">Sélection partie</h2>
        <div className="filtres">
          <div className='input-stylise'>
            <label>Nom </label>
          </div>
          <input
            type="text"
            placeholder="Filtrer par nom"
            value={filtreNom}
            onChange={(e) => setFiltreNom(e.target.value)}
          />
          <div className='input-stylise'>
            <label>Date </label>
          </div>
          <input
            type="date"
            value={filtreDate}
            onChange={(e) => setFiltreDate(e.target.value)}
          />
        </div>
        <div className="menu-deroulant">
          {partiesFiltrees.map((partie, index) => (
            <button 
            key={index} 
            className="menu-item" 
            onClick={() => redirectToPartie(partie.id_partie, partie.nom)}>
              {partie.nom} - {new Date(partie.date_creation).toLocaleDateString()}
          </button>          
          ))}
        </div>
      </div>

      <div className='creation-partie'>
        <h2 className="titre-creation">Création d'une partie</h2>
        <div className='input-stylise'>
          <label>Nom de la partie: </label>
          <input
            type="text"
            value={nomPartie}
            onChange={(e) => setNomPartie(e.target.value)}
          />
        </div>
        <div className='input-stylise'>
          <label>Nombre d'équipes: </label>
          <input
              type="number"
              min="1"
              step="1"
              value={nombreEquipes ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                // Permettre à l'utilisateur de vider le champ
                if (val === '') {
                  setNombreEquipes(undefined);
                } else {
                  // Convertir la valeur saisie en entier
                  const intVal = parseInt(val, 10);
                  // Si la valeur est un nombre et supérieure ou égale à 1, mettre à jour l'état
                  if (!isNaN(intVal) && intVal >= 1) {
                    setNombreEquipes(intVal);
                  }
                }
              }}
            />



        </div>
        <div className="demandes-jour-menu-deroulant">
            {demandesClient.map((demande, index) => (
              <div className="demandes-jour-item" key={index}>
                <input
                  key={index}
                  type="text"
                  value={demande}
                  onChange={(e) => handleDemandeChange(index, e.target.value)}
                  placeholder={`Demande du jour ${index + 1}`}
                />
              </div>
            ))} 
        </div>
        <button onClick={handleSubmit}>Valider</button>
        {messageSuccess && <div className="message-success">{messageSuccess}</div>}
        {messageError && <div className="message-error">{messageError}</div>}
      </div>
    </div>
  );
}

export default AdminPage;





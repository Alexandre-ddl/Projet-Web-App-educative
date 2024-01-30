import React, { useEffect, useState }  from 'react';
import './SupAdminPage.scss';
import { useNavigate } from 'react-router-dom';
import { SupadminService } from '../services/SupadminService';
import { config } from "../config";
import { a } from 'react-spring';

type CheckedPartiesType = {
  [nom: string]: boolean;
};

type AdminData_API = {
  pseudo: string;
  date_creation:  string;
};

type PartieData_API = {
  pseudo: string;
  date_creation:  string;
};

type AdminData = {
  nom: string;
  dateCreation: string;
};


export function SupAdminPage() {
  const adminService = new SupadminService(config.API_URL);  
  const navigate = useNavigate();

  const [checkedParties, setCheckedParties] = useState<CheckedPartiesType>({});
  const [buttons_Partie, setbuttons_Partie] =useState<AdminData[]>([]);

  const [selectedButtonName, setSelectedButtonName] = useState('');
  const [buttons_Admin, setButtonsAdmin] = useState<AdminData[]>([]);

  useEffect(() => {
    adminService.getAdmins().then((u) => {
      const admins = u.data.admins.map((admin : AdminData_API) => ({
        nom: admin.pseudo,
        dateCreation: admin.date_creation // Pas besoin de conversion
      }));
      setButtonsAdmin(admins);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des admins:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedButtonName) {
      adminService.getPartiesByAdmin(selectedButtonName)
            .then(response => {
                const parties = response.data.parties.map((partie : PartieData_API)=> ({
                    nom: partie.pseudo,
                    dateCreation: partie.date_creation
                }));
                setbuttons_Partie(parties); 
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des parties pour l'admin:", error);
            });
    }
}, [selectedButtonName]); // Dépendance à selectedButtonName

  




  // États et fonctions pour les Admins
  const [searchTermAdmin, setSearchTermAdmin] = useState('');
  const [selectedDateAdmin, setSelectedDateAdmin] = useState('');
  const [sortOrderAdmin, setSortOrderAdmin] = useState('asc');

  // États et fonctions pour les Parties
  const [searchTermPartie, setSearchTermPartie] = useState('');
  const [selectedDatePartie, setSelectedDatePartie] = useState('');
  const [sortOrderPartie, setSortOrderPartie] = useState('asc');

  // Fonction pour changer le tri des Admins
  const toggleSortOrderAdmin = () => {
    setSortOrderAdmin(sortOrderAdmin === 'asc' ? 'desc' : 'asc');
  };

  // Fonction pour changer le tri des Parties
  const toggleSortOrderPartie = () => {
    setSortOrderPartie(sortOrderPartie === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedButtonsAdmin = buttons_Admin
    .filter(button =>
      button.nom.toLowerCase().startsWith(searchTermAdmin.toLowerCase()) &&
      (!selectedDateAdmin || button.dateCreation === selectedDateAdmin)
    )
    .sort((a, b) => {
      if (sortOrderAdmin === 'asc') {
        return new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime();
      }
      return new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();
    });


  // Logique de tri et de filtrage pour les Parties
  const filteredAndSortedButtonsPartie = buttons_Partie
  .filter(button =>
    button.nom.toLowerCase().startsWith(searchTermPartie.toLowerCase()) &&
    (!selectedDatePartie || button.dateCreation === selectedDatePartie)
  )
  .sort((a, b) => {
    if (sortOrderPartie === 'asc') {
      return new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime();
    }
    return new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();
  
  });


  const handleButtonClick = (name : string) => {
    setSelectedButtonName(name);
  };

  const handleButtonClick_Partie = (nom: string) => {
    // Inverse l'état de la case à cocher pour cette partie
    const isChecked = checkedParties[nom];
    handleCheckboxChange(nom, !isChecked);
  };

  const handleDelete = () => {

    adminService.deleteAdmin(selectedButtonName)
    .then(response => {
        console.log(response.data.message);
        // Vérifier si le message indique qu'il s'agit d'un Super Admin
        if (response.data.message === "Impossible de supprimer c'est un Super Admin") {
            alert("Impossible de supprimer c'est un Super Admin");
        } else {
          const updatedButtons = buttons_Admin.filter(button => button.nom !== selectedButtonName);
          setButtonsAdmin(updatedButtons);
          // Réinitialiser le nom sélectionné
          setSelectedButtonName('');
        }
    })
    .catch(error => {
        console.error("Erreur lors de la suppression de l'admin:", error);
    });            
    
  };

  const handleRetourPageAdmind = () => {
            navigate('/adminpage');
  };


  const handlegiveSP = () => {

    adminService.give_SP(selectedButtonName)
    .then(response => {
        alert(response.data.message);
    })
    .catch(error => {
        console.error("Erreur lors de la suppression de l'admin:", error);
    });            
    
  };

  const handleCheckboxChange = (nom: string, isChecked: boolean) => {
    setCheckedParties({ ...checkedParties, [nom]: isChecked });
  };

  const handleDelete_Parti = () => {
    console.log('selectedButtonName',selectedButtonName)
    console.log('checkedParties',checkedParties)
    adminService.deleteParties(selectedButtonName, checkedParties)
    .then(response => {
        console.log(response.data.message);

        if (response.data.message === "Impossible de supprimer c'est un Super Admin") {
            alert("Impossible de supprimer c'est un Super Admin");
        } else {
          const newParties = buttons_Partie.filter(partie => !checkedParties[partie.nom]);
          setbuttons_Partie(newParties);
          setCheckedParties({}); 
        }
    })
    .catch(error => {
        console.error("Erreur lors de la suppression de l'admin:", error);
    });   

    
  };
  
  return (
    <div className="Centrer">
    <div className="SuperPage container">
      {/* Conteneur pour les Admins */}
      <div className="SuperPage modal left">
        <div className="Scroll_admin app">
          <div className="Scroll_admin banner">
            Admins
            <input 
              type="text" 
              placeholder="Recherche..." 
              onChange={(e) => setSearchTermAdmin(e.target.value)}
              className="search-input"
            />
            {/* Ajout de la zone d'input pour la date */}
            <input
              type="date"
              value={selectedDateAdmin}
              onChange={(e) => setSelectedDateAdmin(e.target.value)}
              className="date-input"
            />
            {/* Bouton pour le tri */}
            <button onClick={toggleSortOrderAdmin} className="sort-button">
              Tri {sortOrderAdmin === 'asc' ? '⬆️' : '⬇️'}
            </button>
            </div>
            <div className="Scroll_admin scrollable-section">
            {filteredAndSortedButtonsAdmin.map((button, index) => (
            <button
              key={index}
              className="Scroll_admin scrollable-button"
              onClick={() => handleButtonClick(button.nom)}
            >
              {button.nom}
            </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteneur pour les Parties */}
      <div className="SuperPage modal middle">
      {selectedButtonName && (  
      <div className="SuperPage middle-left">
          <div className="Scroll_Parties app">
            <div className="Scroll_Parties banner">
              Parties
              <input 
                type="text" 
                placeholder="Recherche..." 
                onChange={(e) => setSearchTermPartie(e.target.value)}
                className="search-input"
              />
              <input
                type="date"
                value={selectedDatePartie}
                onChange={(e) => setSelectedDatePartie(e.target.value)}
                className="date-input"
              />
              <button onClick={toggleSortOrderPartie} className="sort-button">
                Tri {sortOrderPartie === 'asc' ? '⬆️' : '⬇️'}
              </button>
            </div>
            <div className="Scroll_Parties scrollable-section">

              {filteredAndSortedButtonsPartie.map((partie) => (
                <div key={partie.nom} className="Scroll_Parties button-checkbox-wrapper">
                  <button 
                  onClick={() => handleButtonClick_Partie(partie.nom)}
                  className="Scroll_Parties scrollable-button">

                    {partie.nom}
                  </button>
                  <input 
                      type="checkbox" 
                      checked={!!checkedParties[partie.nom]} 
                      onChange={(e) => handleCheckboxChange(partie.nom, e.target.checked)}
                      className="Scroll_Parties button-checkbox" 
                    />
                </div>
              ))}
              
            </div>
          </div>
          </div>
           )}

        {/* Conteneur pour les Boutons */}
        {selectedButtonName && (  
        <div className="SuperPage middle-right">
          <button className="SuperPage button type-2" onClick={handlegiveSP} >Give SUP AD</button>
          <button onClick={handleDelete_Parti} className="SuperPage button type-1">
          Supprimer Parties
        </button>
        </div>
        )}
      </div>

      {/* Conteneur pour d'autres Boutons */}
      <div className="SuperPage modal right">
      {selectedButtonName && (
          <button className="SuperPage button type-1" onClick={handleDelete}>
            SUPP AD
          </button>
        )}
        <button className="SuperPage button type-2" onClick={handleRetourPageAdmind}>Retour Page AD</button>
      </div>
    </div>
    </div>
  );
}

export default SupAdminPage;

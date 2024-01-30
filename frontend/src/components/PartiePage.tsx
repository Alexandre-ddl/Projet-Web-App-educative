import React, { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./PartiePage.css";
import { useNavigate , useParams } from 'react-router-dom';
import { PartieService } from "../services/PartieService";
import { MyBlogContext } from '../MyBlogContext';
import { config } from "../config";
import ReactModal from 'react-modal'


export function PartiePage() {
    const partieService = new PartieService(config.API_URL);
    const navigate = useNavigate();
    const { admin } = useContext(MyBlogContext);
    const [teams, setTeams] = useState<{teamId: string, playerCount: number}[]>([]);
    const Nompartie = "Nom partie"
    const IdPartie = "IdPartie"
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { idPartie, NomPartie } = useParams();
    console.log(idPartie,admin)
    const ajouteTeams = () => {
        admin && idPartie && partieService.addTeam(admin.admin,idPartie).then(() => {
            obtainTeams();
        });
    }
    
    const obtainTeams = () => {   
        admin && idPartie && partieService.getTeams(admin.admin,idPartie ).then((u) => {
            console.log('Response from API: ', u); // Log the entire response
            setTeams(u.data);
            console.log('Teams after setting state: ', teams); // Log the teams after setting state
        }).catch(error => {
            console.error("Erreur:", error);
        });
    };
    
    useEffect(() => {
        {
            obtainTeams();
        }
    }, [admin]);


    const ClickKPI = (idPartie: number, NomPartie: string ) => {
        navigate(`/kpi-all-team/${idPartie}/${NomPartie}`); 
    };

    const ClickRetour = () => {
        navigate("/adminpage"); 
    };

    const handleDeleteClick = () => {
        setIsModalOpen(true);
    };



    const handleTeamClick = (pseudo_equipe: string) => {
        console.log('id Partie : ', `${idPartie}${pseudo_equipe}`);
        const Nompartie = `${idPartie}${pseudo_equipe}`
        console.log(Nompartie)
        navigate(`/TeamContentPage/${Nompartie}/${pseudo_equipe}`);
    };
    


    const handleDeleteConfirm = () => {
        idPartie && partieService.deletePartie(parseInt(idPartie) ).then((u) => {
            console.log('La partie a été supprimée',u.data);
            navigate("/adminpage")
            setIsModalOpen(false);
           
        }).catch(error => {
            console.error("Erreur:", error);
        });
        
    };

    const handleDeleteCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <body>
            <h1 className="bandeau">
                <div className="nomp">
                    Nom Partie : {NomPartie}
                </div>
                <div className="idp">
                    id Partie : {idPartie}
                </div>    
            </h1>
            <div className="Centrer">
            <div className="fullbox">
                <div className="container1">
                    <div className="banner">Équipes</div>
                    <div className="scrollable-section">
                        {teams.map((team, index) => (
                            <button key={index} onClick={ () =>handleTeamClick(team.teamId)}>
                                Id de l'équipe: {team.teamId}<br></br> 
                                Nombre de joueurs: {team.playerCount}
                                
                            </button>


                        ))}
                    </div>
                    <button onClick={ajouteTeams}>Ajouter une équipe</button>

                </div> 
                <div className="container2">
                    <div className="banner">Action</div>
                    <div className="boutons">
                        <button className="kpi" onClick={() => {
                                            if (idPartie && NomPartie) {
                                                ClickKPI(parseInt(idPartie), NomPartie);
                                            }
                                            }} >KPI </button>
                        <button className="supp" onClick={handleDeleteClick}>Supprimer la partie</button>
                        <button className="retour" onClick={ClickRetour}>Retour</button>
                    </div>
                </div>
            </div>
            <ReactModal
                isOpen={isModalOpen}
                contentLabel="Confirm Deletion"
            >
                <h2>Are you sure you want to delete this?</h2>
                <button onClick={handleDeleteConfirm}>Yes</button>
                <button onClick={handleDeleteCancel}>No</button>
            </ReactModal>
            </div>
        </body>
    )
}

export default PartiePage;
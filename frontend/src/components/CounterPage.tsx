import React, { useState, useEffect,useRef,RefObject, useContext } from 'react';
import './CounterPage.css';

import { useNavigate } from 'react-router-dom';

import { User } from "../dto/User";
import { config } from "../config";
import { MyBlogContext } from "../MyBlogContext";
import { UserService } from '../services/UserService';


export function CounterPage() {
    const { user , setUser } = useContext(MyBlogContext);
    const userService = new UserService(config.API_URL);
    const navigate = useNavigate();

    const [dots, setDots] = useState('');
    const [playersCount, setPlayersCount] = useState(0);
    const [pseudo , setPseudo] = useState('')

    const [loading, setLoading] = useState(true);
    const [showWarning, setShowWarning] = useState(false);
    const [totalHeight, setTotalHeight] = useState(0);
    const [showBoutton, setshowBoutton] = useState(true);
    const [stopApi, setstopApi] = useState(true);

    const [teamMembers, setTeamMembers] = useState([]);
    const [hasClickedStart, setHasClickedStart] = useState(false);


    

    useEffect(() => {
        const legos: HTMLElement[] = [];
        const colors = ['#e4002b', '#FF6D01', '#FFD500', '#00A51A', '#0096db', '#0045A1', '#FF3EC7'];

        const handleClick = (event: MouseEvent) => {
            legos.forEach((lego) => {
                const rect = lego.getBoundingClientRect();
                const distance = Math.hypot(event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2);
                if (distance < 100) {
                    lego.remove();
                }
            });
        };

        

        document.body.addEventListener('click', handleClick);

        const addLegoBrick = () => {
          let lego = document.createElement("div");
          lego.classList.add("lego-brick");
          lego.style.left = Math.floor(Math.random() * (window.innerWidth - 100)) + "px"; 
          lego.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          lego.style.top = "-60px";  // Assure que le LEGO est généré hors de l'écran en haut
  
          legos.push(lego);
          document.body.appendChild(lego);
  
          lego.addEventListener("animationend", () => {
              lego.remove();
          });
      };

        const intervalLego = setInterval(addLegoBrick, Math.random() * ((5000/3) - (500/3)) + (500/3));

        const dotsInterval = setInterval(() => {
            setDots(prevDots => (prevDots.length < 3 ? prevDots + '.' : ''));
        }, 500);        

        return () => {
            
            clearInterval(intervalLego);
            clearInterval(dotsInterval);
            legos.forEach((lego) => lego.remove());
            document.body.removeEventListener('click', handleClick);
        };
    }, [totalHeight]);  // Suppression des dépendances pour résoudre l'avertissement


    useEffect(() => {

        const requestGameStart = () => {
            
            user && setPseudo(user.id_player);
            user && userService.request_game_startUser(user.id_equipe,user.id_player)
            .then(data => {
                console.log("Game start requested successfully!", data);
            })
            .catch(error => {
                console.error("Erreur lors de la demande de démarrage du jeu:", error);
            });
        };
    
        // Call the API immediately
        requestGameStart();


        const updateTeamMembers = () => {
            
            user && userService.connectedUser(user.id_equipe,user.id_player).then((u) => {
                setTeamMembers(u.data.players);
            })   
           .catch(error => {
                console.error("Erreur:", error);
            });
        };
    
        // Appelle la fonction immédiatement
        updateTeamMembers();
    
        // Met en place un intervalle pour appeler la fonction tous les 5 secondes
        const intervalId = setInterval(updateTeamMembers, 1000);
    
        // Nettoie l'intervalle lors de la désinscription du composant
        return () => clearInterval(intervalId);
    
    }, []);  // Le tableau de dépendance vide signifie qu'il s'exécutera une fois au montage et au démontage
    
    useEffect(() => {
        // Mettre à jour le nombre de joueurs à chaque fois que teamMembers change
        setPlayersCount(teamMembers.length);
    }, [teamMembers]);

    useEffect(() => {
        if (playersCount === 5) {
            navigate('/gameInProgress');
        }
    }, [playersCount]);

    const handleStartGame = () => {
        setLoading(false);
        if (playersCount < 5) {
            setShowWarning(true);
        } else {
            navigate('/gameInProgress');
        }
    };

    const handleButtonClick = () => {
        
        user && userService.cliqueboutonUser(user.id_equipe,user.id_player).then((u) => {
            if (u.data.status === "success"){
                setshowBoutton(false);
                setHasClickedStart(true);  
                console.log("clique_bouton_start");
            }
        })
        .catch(error => {
            console.error("Erreur lors de la mise à jour du bouton de démarrage:", error);
        });

    
    };

    const checkPlayersReadiness = () => {
        
        user && userService.playerreadinessUser(user.id_equipe).then((u) => {
            if (u.data.value) {
                console.log("all player ready ");
                
                user && userService.asignroleUser(user.id_equipe,user.id_player).then((u) => {
                    console.log(u.data.message);
                    setstopApi(false);
                    navigate('/gameInProgress');
                })
                .catch(error => {
                    console.error("Erreur lors de l'assignation des rôles:", error);
                });
    
            }

        })
        .catch(error => {
            console.error("Erreur lors de la vérification de la préparation des joueurs:", error);
        });
    };
    const intervalId = useRef<NodeJS.Timeout | null>(null);
  
    useEffect(() => {
        if (hasClickedStart && stopApi) {
            intervalId.current = setInterval(checkPlayersReadiness, 5000); // Vérifie toutes les 5 secondes
        } else if (!stopApi && intervalId.current) {
            clearInterval(intervalId.current);
        }
    
        return () => {
            if (intervalId.current) clearInterval(intervalId.current);
        };
    }, [hasClickedStart, stopApi]);
    
    
    
    
    

    return (
        <div className="counter-container">
            {loading ? (
                <div className="loading-container">
                    <h1 className="title">En attente{dots}</h1>
                    <p className="description">Joueur connecté: {pseudo}</p>
                    <p className="description">Membres de l'équipe: {teamMembers.join(", ")}</p>
                    <button className="button" onClick={handleStartGame}>Lancer la partie</button>
                </div>
            ) : showWarning ? (
                <div className="warning-container">
                    <p className="warning-text">⚠️ Les joueurs sont {playersCount}/5. Voulez-vous quand même lancer la partie? ⚠️</p>
                    {showBoutton && (
                        <button className="button" onClick={handleButtonClick} >Oui</button>
                    )}
                    
                </div>
            ) : (
                <div className="game-info">
                    <h1 className="title">Compteur: {playersCount}/5</h1>
                    <p className="description">Connecté en tant que: {pseudo}</p>
                </div>
            )}
        </div>
    );
}

export default CounterPage;

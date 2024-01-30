

import React ,{useContext,useEffect,useState, useRef} from "react";
import ProgressBar from "../progress_bar/ProgressBar";
import Step from "../progress_bar/Step";
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/UserService';
import { config } from "../config";

import boite from '../image_jouflux/carton_full.png';
import carton from '../image_jouflux/carton.png';
import capsule_magique from '../image_jouflux/fusion.png';
import rose from '../image_jouflux/pomme.png';
import raisin from '../image_jouflux/raisin.png';
import deliver from '../image_jouflux/deliver.png'
import order_confirmed from '../image_jouflux/order_confirmed_2.png'
import kpi from '../image_jouflux/kpi.png'
import { MyBlogContext } from '../MyBlogContext';


type StepProps = {
  accomplished: boolean;
};

type StepType = 'deliver'|'order_confirmed'|'raisin' | 'rose' | 'carton' |'boite'|'capsule_magique' ;





const resourceImages: Record<StepType, string> = {
  order_confirmed:order_confirmed,
  raisin: raisin,
  rose: rose,
  carton: carton,
  capsule_magique: capsule_magique,
  boite: boite,
  deliver:deliver
};

const stepPercentages: Record<StepType, number> = {
  order_confirmed:16.67,
  raisin: 16.67,
  rose: 16.67,
  carton: 16.67, 
  capsule_magique :16.67,
  boite : 16.67,
  deliver: 16.67


};

/*function updateDayInDatabase() {
  

  return fetch('http://127.0.0.1:8000/add_equipes_info_jour', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id_equipe : id_equipe }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Problème lors de la mise à jour du jour dans la base de données');
    }
    return response.json();
  })
  .then(data => {
    return data.latest_day;
  })
  .catch(error => {
    console.error("Erreur lors de la mise à jour du jour:", error);
    throw error;
  });
}*/


export function GameInProgress() {
  const { user } = useContext(MyBlogContext);
  const userService = new UserService(config.API_URL);

  const navigate = useNavigate();
  const [local,setLocal]= useState({
    showModal: false, //ok
    showJobModal: false,  //ok
    showModalOrderConfirmed: false,   //ok
    showModalDeliver: false,  //ok
    showModalCreate: false, //ok
    showQuantitéModal:false, //ok
    showModalImage:false, //ok
     //ok
    showModalechange : false , 
  });
  const [state, setState] = useState({
    percent: 0,
    showModalReçu: true,
    currentStep: 'deliver',
    resources: {
      order_confirmed:0,
      raisin: 0,
      rose: 0,
      carton: 0,
      capsule_magique: 0,
      boite: 1,
      deliver:0
    },
    receivedResources: {
      order_confirmed:0,
      raisin: 5,
      rose: 5,
      carton: 5,
      capsule_magique: 0,
      boite: 0,
      deliver:0
    },
    dayCounter: 0,
    timeOfDay: '8 h',
  });

  useEffect(() => {
    if (user) {
      console.log(user.id_equipe);
      userService.get_stock_var(user.id_equipe)
        .then((u) => {
          console.log(u.data);
  
          setState(prevState => ({
            ...prevState,
            dayCounter: u.data.jour,
            resources: {
              ...prevState.resources,
              raisin: u.data.stock_raisin,
              rose: u.data.stock_rose,
              carton: u.data.stock_carton,
              capsule_magique: u.data.stock_capsule,
              boite: u.data.stock_boite,
            },
            receivedResources: {
              ...prevState.resources,
              raisin:u.data.q_reçu_raisin ,
              rose: u.data.q_reçu_rose,
              carton: u.data.q_reçu_carton,
             
            }
          }));
        })
        .catch(error => {
          console.error("Erreur:", error);
        });
    }
  }, [user, state.dayCounter]);  // Inclure user.id_equipe ici si vous souhaitez que l'effet se déclenche lors de la modification de cette valeur
  

  const [QuantIntermediaire,setQuantIntermediaire] = useState({
          order_confirmed:0,
          raisin: 0,
          rose: 0,
          carton: 0,
          capsule_magique: 0,
          boite: 0,
          deliver:0
  })


  const jobButtonRef = useRef<HTMLButtonElement>(null);
  const id_equipe = localStorage.getItem("id_equipe");

  useEffect(() => {
    // Créer une seule instance de WebSocket
    if (state.dayCounter >= 1 ) {
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${id_equipe}`);
  
    ws.onopen = () => {
      // Envoie l'état initial à la connexion
      ws.send(JSON.stringify(state));
    };
  
    ws.onmessage = (event) => {
      const receivedState = JSON.parse(event.data);
      // Ne met à jour l'état que si receivedState.percent est égal ou supérieur
      if (receivedState.percent >= state.percent || (state.percent >= 100.02000000000001 && receivedState.percent ===0))  {
        setState(receivedState);
      } else {
        // Sinon, envoie l'état local actuel
        ws.send(JSON.stringify(state));
      }
    };
  
    // Envoie l'état à chaque modification de state.percent
    const sendState = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(state));
      }
    };
  
    // Ajoute un écouteur pour state.percent
    const observer = new MutationObserver(sendState);
    observer.observe(document.body, { attributes: true, childList: false, subtree: false }); // Vous devrez ajuster le sélecteur pour qu'il corresponde à votre logique d'application
  
    return () => {
      ws.close();
      observer.disconnect();
    };
  }
  }, [id_equipe, state.percent,state.dayCounter]);
  
  

  // Les pourcentages associés à chaque étape
  

  const addResource = (type: StepType, amount: number) => {
    setState(prevState => ({
      ...prevState,
      resources: {
        ...prevState.resources,
        [type]: prevState.resources[type] + amount
      }
    }));
  };

  const getResourceCount = (type: StepType) => {
    return state.resources[type];
  };


  const toggleJobModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLocal(prevState => {
        if (prevState.showJobModal) {
          if (prevState.showQuantitéModal || prevState.showModalCreate || prevState.showModalOrderConfirmed || prevState.showModalDeliver) {
            return {
              ...prevState,
              showJobModal:false,
              showModal:true
            };
          }else {
            return{
              ...prevState,
              showJobModal:false,
              showModal:false
            };
          }
                     
        } else {
            return { 
              ...prevState, 
              showJobModal: true,
              showModal: true };
        }
    });
};
const toggleImageModal = () => {
  setLocal(prevState => ({
    ...prevState,
    showModalImage: !prevState.showModalImage
  }));

  user &&navigate(`/kpi/${user.id_equipe}/${0}`); 
 
};


const handleClick = (step: StepType, accomplished: boolean) => {
    const currentStep = state.currentStep as StepType;
    if (accomplished) {
      if (step === 'deliver' && currentStep ==='boite') {
        setState(prevState => ({...prevState,currentStep: step }))
        setLocal(prevState => ({ ...prevState,showModal: true, showModalDeliver: true}));
      } else if (step === 'order_confirmed' && currentStep ==='deliver') {
        setState(prevState => ({...prevState,currentStep: step }))
        setLocal(prevState => ({ ...prevState,showModal: true, showModalOrderConfirmed: true }));
      } else if (step === 'boite'&& currentStep ==='capsule_magique') {
        setState(prevState => ({...prevState,currentStep: step }))
        setLocal(prevState => ({ ...prevState,showModal: true, showModalCreate: true }));   
      } else if (step === 'capsule_magique' && currentStep ==='carton') {
        setState(prevState => ({...prevState,currentStep: step }))
        setLocal(prevState => ({ ...prevState,showModal: true,showModalCreate: true })); 
      } else if ((step === 'carton' && currentStep ==='rose')){
        setState(prevState => ({...prevState,currentStep: step }))
        setLocal(prevState => ({ ...prevState,showModal: true, showQuantitéModal : true }));
      } else if ((step === 'rose' && currentStep ==='raisin')){
        setState(prevState => ({...prevState,currentStep: step }))
        setLocal(prevState => ({ ...prevState,showModal: true,showQuantitéModal : true }));
      } else if ((step === 'raisin' && currentStep ==='order_confirmed')){
        setState(prevState => ({...prevState,currentStep: step }))
        setLocal(prevState => ({ ...prevState,showModal: true, showQuantitéModal : true }));
      }
    }
  };

  
  


  const closeModal = (increment: number) => {
    
    setState(prevState => {
      const newPercent = prevState.percent + increment;
      let newTimeOfDay = prevState.timeOfDay;
      const newDay = prevState.dayCounter + 1;
  
  
      switch (newPercent) {
        case 66.68:
          newTimeOfDay = '13 h';
          break;
        case 100.02000000000001:
          newTimeOfDay = '17 h';
          break;
        default:
          break;
      }
  
      if (newPercent >= 116.67  ) {
        user && console.log(
          user.id_equipe,
          prevState.dayCounter, 
          QuantIntermediaire.capsule_magique,
          QuantIntermediaire.boite,
          QuantIntermediaire.deliver,
          QuantIntermediaire.raisin,
          QuantIntermediaire.rose,
          QuantIntermediaire.boite,)
        user && userService.add_equipe_info(user.id_equipe,
                                            prevState.dayCounter, 
                                            QuantIntermediaire.capsule_magique,
                                            QuantIntermediaire.boite,
                                            QuantIntermediaire.deliver,
                                            QuantIntermediaire.raisin,
                                            QuantIntermediaire.rose,
                                            QuantIntermediaire.boite,
                                            )
        .then((u) => {
          })   
        .catch(error => {
              console.error("Erreur:", error);
          });
        

        
        setLocal(prevState => ({
          ...prevState,
          showModal: false,
          showModalOrderConfirmed: false,
          showQuantitéModal:false,
          showModalDeliver : false,
          showModalCreate: false,

        }));
        return {
          ...prevState, 
          showModalReçu: true,     
          percent: 0,
          dayCounter: newDay,
          timeOfDay: '8 h', 

          receivedResources : prevState.receivedResources
        };
        



      } else {
        setLocal(prevState => ({
          ...prevState,
       
          showModal: false,
          showModalOrderConfirmed: false,
          showQuantitéModal:false,
          showModalDeliver : false,
          showModalCreate: false,

        }));
        return {
          ...prevState,
          showModalReçu: false,
          percent: newPercent,
          dayCounter: prevState.dayCounter,
          timeOfDay: newTimeOfDay,

          receivedResources : prevState.receivedResources
        };
      }

    });
  };
  
  

  const handleOutsideClick = (e: React.MouseEvent ) => {
    if (e.target === e.currentTarget) {
        setLocal(prevState => ({ 
          ...prevState,
          showModal: false, 
          showJobModal: false,
          showQuantitéModal:false,
          showModalCreate:false,
          showModalOrderConfirmed:false,
          showModalDeliver:false ,
          showModalechange:false , 
        }));
    }
};




  const handleOutsideReçuClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const targetResources = { ...state.resources };
      Object.keys(state.receivedResources).forEach((key) => {
        const resourceKey = key as StepType;
        targetResources[resourceKey] += state.receivedResources[resourceKey];
      });
  
      let interval = setInterval(() => {
        setState(prevState => {
          const updatedResources = { ...prevState.resources };
          let reachedTarget = true;
  
          Object.keys(state.receivedResources).forEach((key) => {
            const resourceKey = key as StepType;
            if (updatedResources[resourceKey] < targetResources[resourceKey]) {
              updatedResources[resourceKey] += 1;
              reachedTarget = false;
            }
          });
  
          if (reachedTarget) {
            clearInterval(interval);
          }
  
          return { ...prevState, resources: updatedResources };
        });
      }, 1); // mise à jour toutes les 100 millisecondes
  
      setState(prevState => ({ ...prevState, showModalReçu: false }));
    }
  };
  

  const imageHover = () => {
    const image = document.querySelector("[alt='KPI']");
    if (image && image instanceof HTMLElement) {
        image.style.transform = 'scale(0.15)'; // Légère augmentation de la taille au survol
    }
};

    const imageOut = () => {
        const image = document.querySelector("[alt='KPI']");
        if (image && image instanceof HTMLElement) {
            image.style.transform = 'scale(0.1)'; // Retour à la taille initiale
        }
    };


  const [inputQuantity, setInputQuantity] = useState('');
  const [clique, setClique] = useState(false);

  const validateQuantity = () => {
    const quantity = Number(inputQuantity);
    const currentStep = state.currentStep as StepType;
    
    if (currentStep === 'deliver') {
      if (!isNaN(quantity) && quantity >= 0 && quantity <= state.resources['boite']) {
        setQuantIntermediaire(prevState => ({
          ...prevState,
          deliver  : quantity
        }));

        setState(prevState => ({
          ...prevState,
          resources: {
            ...prevState.resources,
            boite: prevState.resources.boite - quantity 
          }
        }));
        closeModal(stepPercentages[currentStep]);
        setInputQuantity('')
      } else {
        setInputQuantity('')
        alert("Quantité invalide. Veuillez entrer un nombre positif qui ne dépasse pas la quantité en stock.");
      }
     
    } else if (currentStep === 'boite'){
      if (!isNaN(quantity) && quantity >= 0 && quantity <= state.resources['capsule_magique']/10 && 2*quantity <= state.resources['carton']) {
        setQuantIntermediaire(prevState => ({
          ...prevState,
          boite  : quantity
        }));
        
        setState(prevState => ({
          ...prevState,
          resources: {
            ...prevState.resources,
            boite: prevState.resources.boite + quantity ,
            carton: prevState.resources.carton - 2*quantity,
            capsule_magique: prevState.resources.capsule_magique - quantity
          }
        }));
        
        
        closeModal(stepPercentages[currentStep]);
        setInputQuantity('')
      } else {
        setInputQuantity('')
        alert("Quantité invalide. Veuillez entrer un nombre positif qui ne dépasse pas la quantité en stock.");
      }
    } else if (currentStep ==='capsule_magique') {
      if (!isNaN(quantity) && quantity >= 0 && quantity <= state.resources['raisin'] && quantity <= state.resources['rose']) {
        setQuantIntermediaire(prevState => ({
          ...prevState,
          capsule_magique  : quantity
        }));
        setState(prevState => ({
          ...prevState,
          resources: {
            ...prevState.resources,
            raisin: prevState.resources.raisin - quantity ,
            rose: prevState.resources.rose - quantity,
            capsule_magique: prevState.resources.capsule_magique + quantity
          }
        }));

        closeModal(stepPercentages[currentStep]);
        setInputQuantity('')
      } else {
        setInputQuantity('')
        alert("Quantité invalide. Veuillez entrer un nombre positif qui ne dépasse pas la quantité en stock.");
      }
 
    } else if (currentStep ==='carton'){
      if (!isNaN(quantity) && quantity >= 0 && quantity <= 30) {
        setQuantIntermediaire(prevState => ({
          ...prevState,
          carton  : quantity
        }));
        setState(prevState => ({
          ...prevState,
          receivedResources: {
            ...prevState.receivedResources,
            carton: quantity ,
          }
        }));
        closeModal(stepPercentages[currentStep]);
        setInputQuantity('')
      } else {
        setInputQuantity('')
        alert("Quantité invalide. Veuillez entrer un nombre positif qui ne dépasse pas la quantité en stock.");
      }
    }  else if (currentStep ==='raisin'){
      if (!isNaN(quantity) && quantity >= 0 && quantity <= 30) {
        setQuantIntermediaire(prevState => ({
          ...prevState,
          raisin  : quantity
        }));
        setState(prevState => ({
          ...prevState,
          receivedResources: {
            ...prevState.receivedResources,
            raisin: quantity ,
          }
        }));
        closeModal(stepPercentages[currentStep]);
        setInputQuantity('')
      } else {
        setInputQuantity('')
        alert("Quantité invalide. Veuillez entrer un nombre positif qui ne dépasse pas la quantité en stock.");
      }
    } else if (currentStep ==='rose'){
      console.log(quantity,!isNaN(quantity))
      if (!isNaN(quantity) && quantity >= 0 && quantity <= 30) {
        setQuantIntermediaire(prevState => ({
          ...prevState,
          rose  : quantity
        }));
        setState(prevState => ({
          ...prevState,
          receivedResources: {
            ...prevState.receivedResources,
            rose: quantity ,
          }
        }));
        closeModal(stepPercentages[currentStep]);
        setInputQuantity('')
      } else {
        setInputQuantity('')
        alert("Quantité invalide. Veuillez entrer un nombre positif qui ne dépasse pas la quantité en stock.");
      }
    }
    console.log("currentStep",currentStep)
    
  };
  
    
  return (
      <div>
        
        <img 
  src={kpi}
  alt="KPI" 
  onClick={toggleImageModal}
  style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      cursor: 'pointer',
      transform: 'scale(0.1)',
      transformOrigin: 'top right', // Adjust the origin of transformation
      transition: 'transform 0.2s',
      zIndex: 1000,
  }}
  onMouseOver={() => imageHover()}
  onMouseOut={() => imageOut()}
/>



        
      <button 
          ref={jobButtonRef}
          onClick={toggleJobModal} 
          style={{
              background: '#0099FF', 
              color: '#fff', 
              padding: '8px 15px',
              margin: '10px', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              zIndex: 1000,
              position: 'fixed', // Changer à fixed
              top: '10px', // Positionner en haut
              left: '10px', // Positionner à gauche
          }}>
          Info Job
      </button>

      <button 
        ref={jobButtonRef}
        onClick={toggleJobModal} 
        style={{
            background: '#0099FF', 
            color: '#fff', 
            padding: '8px 15px',
            margin: '10px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            zIndex: 1000,
            position: 'fixed', // Toujours en position fixed pour rester à l'endroit spécifié
            bottom: '10px', // Positionner en bas
            right: '10px', // Positionner à droite
        }}>
        Echange Job
    </button>


      <div style={{
          display: 'flex',
          flexDirection: 'column', // Stack the children vertically
          justifyContent: 'center', // Center the children vertically in the container
          alignItems: 'center', // Center the children horizontally in the container
          gap: '50px', // This creates space between the flex items
          textAlign: 'center' // This will ensure the text inside the h1 and p is centered
        }}>
          <h1>Jour : {state.dayCounter}</h1>
          <p>Moment de la journée : {state.timeOfDay}</p>
        </div>


        <div>
          

        
        
        


        {local.showModal && (
          <div onClick={handleOutsideClick} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', zIndex: 998
          }}>
            {/* Fenêtre de "Job" */}
            {local.showJobModal && (
              <div style={{
                position: 'fixed', top: '10%', left: '10%', // Modifiez ces valeurs pour positionner la fenêtre en haut à gauche
                background: '#e0e0e0', padding: '20px', borderRadius: '8px', boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.5)', zIndex: 999,
                display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}>
                <div>Informations du Job</div>
                {/* Vous pouvez ajouter plus de contenu ici */}
              </div>
            )}

            {/* Fenêtre de "echange" */}
            {local.showModalechange && (
                  <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
                      zIndex: 999,
                      display: 'flex',
                      justifyContent: 'center', // Centrer horizontalement
                      alignItems: 'center', // Centrer verticalement
                  }}>
                      <div style={{
                          width: '80%', // Largeur de la modale
                          maxHeight: '80%', // Hauteur maximale
                          background: '#e0e0e0',
                          padding: '20px',
                          borderRadius: '8px',
                          boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.5)',
                          overflowY: 'auto', // Permettre le défilement si le contenu dépasse la hauteur maximale
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                      }}>
                          <div>Echange</div>
                          {/* Vous pouvez ajouter plus de contenu ici */}
                      </div>
                  </div>
              )}


            {/* Fenêtre de "Quantité" */}
            {local.showQuantitéModal && (

                  <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    background: '#d1e7dd', padding: '20px', borderRadius: '8px', boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.5)', zIndex: 1000,
                    display: 'flex', flexDirection: 'column', alignItems: 'center'
                  }}>
                    <div style={{ marginBottom: '10px', width: '100%' }}>
                      <label style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        Quantité Commandée de {state.currentStep} :
                      </label>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <input type="number" 
                             value={inputQuantity} 
                             onChange={(e) => setInputQuantity(e.target.value)}
                             style={{
                        padding: '5px 10px', fontSize: '16px', border: '1px solid #ccc',
                        borderRadius: '4px', width: '200px', boxShadow: 'inset 0px 0px 5px rgba(0, 0, 0, 0.1)',
                        WebkitAppearance: 'none', MozAppearance: 'textfield',
                      }} />
                    </div>
                    <button onClick={() => {
                              if (state.currentStep in stepPercentages) {
                                validateQuantity();
                              }}} 
                            style={{
                      background: '#4CAF50', color: '#fff', padding: '8px 15px',
                      border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
                    }}>
                      Valider
                    </button>
                  </div>        
            )}

          {local.showModalCreate && (
            <div style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: '#d1e7dd', padding: '20px', borderRadius: '8px', boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.5)', zIndex: 1000,
              display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <div style={{ marginBottom: '10px', width: '100%' }}>
                <label style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  Quantité produite de {state.currentStep} :
                </label>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <input type="number" 
                        value={inputQuantity} 
                        onChange={(e) => setInputQuantity(e.target.value)}
                        style={{
                  padding: '5px 10px', fontSize: '16px', border: '1px solid #ccc',
                  borderRadius: '4px', width: '200px', boxShadow: 'inset 0px 0px 5px rgba(0, 0, 0, 0.1)',
                  WebkitAppearance: 'none', MozAppearance: 'textfield',
                }} />
              </div>
              <button onClick={() => {
                              if (state.currentStep in stepPercentages) {
                                validateQuantity();
                              }}}  
                      style={{background: '#4CAF50', color: '#fff', padding: '8px 15px',
                border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
              }}>
                Valider
              </button>
            </div>
          
        )}


        {local.showModalDeliver && (
          
            <div style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: '#d1e7dd', padding: '20px', borderRadius: '8px', boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.5)', zIndex: 1000,
              display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <div style={{ marginBottom: '10px', width: '100%' }}>
                <label style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  Quantité livrée :
                </label>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <input type="number"
                      value={inputQuantity} 
                      onChange={(e) => setInputQuantity(e.target.value)} 
                        style={{
                  padding: '5px 10px', fontSize: '16px', border: '1px solid #ccc',
                  borderRadius: '4px', width: '200px', boxShadow: 'inset 0px 0px 5px rgba(0, 0, 0, 0.1)',
                  WebkitAppearance: 'none', MozAppearance: 'textfield',
                }} placeholder="Nombre de commande client" />
              </div>
              <button onClick={() => {
                              if (state.currentStep in stepPercentages) {
                                validateQuantity();
                              }}}  
                      style={{
                background: '#4CAF50', color: '#fff', padding: '8px 15px',
                border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
              }}>
                Valider
              </button>
            </div>
        )}

        {local.showModalOrderConfirmed && (
              <div style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: '#d1e7dd', padding: '20px', borderRadius: '8px', boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.5)', zIndex: 1000,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' // Ajout de justifyContent ici
              }}>
                <div style={{ marginBottom: '10px', width: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column' }}> {/* Modification du display à 'flex' et ajout de flexDirection ici */}
                  <label style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    Commande client :
                  </label>
                  {["boite"].map((resource) => (
                    <div key={resource} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={resourceImages[resource as StepType]} width="30" style={{ marginRight: '10px' }} />
                      {state.receivedResources && state.receivedResources[resource as StepType]}
                    </div>
                  ))}
                </div>
                <button onClick={() => {
                          if (state.currentStep in stepPercentages) {
                            closeModal(stepPercentages[state.currentStep as StepType]);
                          }}}  
                        style={{
                  background: '#4CAF50', color: '#fff', padding: '8px 15px',
                  border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
                }}>
                  OK
                </button>
              </div>
          )}





          </div>



        )}

        <ProgressBar percent={state.percent} filledBackground="linear-gradient(to right, #fefb72, #f0bb31)">
          
        <Step transition="scale">
            {({ accomplished }: StepProps) => (
              <img
                onClick={() => handleClick('order_confirmed', accomplished)}
                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                width="30"
                src={order_confirmed}
              />
            )}
          </Step>
          
          
          
          
          <Step transition="scale">
            {({ accomplished }: StepProps) => (
              <img
                onClick={() => handleClick('raisin', accomplished)}
                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                width="30"
                src={raisin}
              />
            )}
          </Step>

          <Step transition="scale">
            {({ accomplished }: StepProps) => (
              <img
                onClick={() => handleClick('rose', accomplished)}
                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                width="30"
                src={rose}
              />
            )}
          </Step>

          <Step transition="scale">
            {({ accomplished }: StepProps) => (
              <img
                onClick={() => handleClick('carton', accomplished)}
                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                width="30"
                src={carton}
              />
            )}
          </Step>

          <Step transition="scale">
            {({ accomplished }: StepProps) => (
              <img
                onClick={() => handleClick('capsule_magique', accomplished)}
                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                width="30"
                src={capsule_magique}
              />
            )}
          </Step>

          <Step transition="scale">
            {({ accomplished }: StepProps) => (
              <img
                onClick={() => handleClick('boite', accomplished)}
                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                width="30"
                src={boite}
              />
            )}
          </Step>

          <Step transition="scale">
            {({ accomplished }: StepProps) => (
              <img
                onClick={() => handleClick('deliver', accomplished)}
                style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                width="30"
                src={deliver}
              />
            )}
          </Step>


        </ProgressBar>
        </div>
        {/* Barre de ressources en bas à gauche */}
        <div style={{
              position: 'fixed',
              bottom: '10px',
              left: '10px',
              background: '#f5f5f5',
              padding: '10px',
              borderRadius: '8px',
              boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.5)'
        }}>
            <h4 style={{ textAlign: 'center' }}>Stocks</h4>
            {Object.keys(state.resources).filter((type: any) => (
                ['boite', 'carton', 'capsule_magique', 'rose', 'raisin'].includes(type)
            )).map((type: any) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={resourceImages[type as StepType]} alt={type} width="30" style={{ marginRight: '10px' }} />
                    {getResourceCount(type as StepType)}
                </div>
            ))}
        </div>


        
          {state.showModalReçu && (
              <div onClick={handleOutsideReçuClick} style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', zIndex: 1002
              }}>
                  {/* Modal with received quantities */}
                  <div style={{
                      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      background: '#d1e7dd', padding: '20px', borderRadius: '8px', boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.5)', zIndex: 1000,
                      display: 'flex', flexDirection: 'column', alignItems: 'center'
                  }}>
                      <div>Quantités reçues:</div>
                      {["raisin", "rose", "carton"].map((resource) => (
                          <div key={resource} style={{ display: 'flex', alignItems: 'center' }}>
                              <img src={resourceImages[resource as StepType]} width="30" style={{ marginRight: '10px' }} />
                              {state.receivedResources && state.receivedResources[resource as StepType]}
                          </div>
                      ))}
                      <button onClick={handleOutsideReçuClick} style={{
                          marginTop: '10px', background: '#4CAF50', color: '#fff', padding: '8px 15px',
                          border: 'none', borderRadius: '4px', cursor: 'pointer'
                      }}>
                          Fermer
                      </button>
                  </div>
              </div>
          )}


          {local.showModalImage && (
              <div onClick={toggleImageModal} style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', zIndex: 1002
              }}>
                
              </div>
          )}


      </div>
    );
}

export default GameInProgress;
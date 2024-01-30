import React, { useEffect, useContext,useState  } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

import { User } from "../dto/User";
// import { MyBlogContext } from "../MyBlogContext";
import { config } from "../config";
import { AdminService } from '../services/AdminService';


import cartonFull from '../image_jouflux/carton_full.png';
import carton from '../image_jouflux/carton.png';
import fusion from '../image_jouflux/fusion.png';
import pomme from '../image_jouflux/pomme.png';
import raisin from '../image_jouflux/raisin.png';



export function CreationAdminPage() {
  // const context = useContext(MyBlogContext);

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [message, setMessage] = useState(''); 
  const adminService = new AdminService(config.API_URL);

  const handleAdminRegister = () => {
    if (!pseudo || !email || !password) {
      setMessage('Veuillez remplir tous les champs.');
      return;
    }
    adminService.registerAdmin(pseudo, email, password)
      .then(response => {
        if(response.data && response.data.status) {
          setMessage('Inscription réussie !');
          navigate("/Connexion_Admin"); // Redirection vers la page de connexion admin après l'inscription
        } else {
          setMessage('Échec de l\'inscription. Veuillez réessayer.');
        }
      })
      .catch(error => {
        setMessage(`Une erreur est survenue lors de l'inscription : ${error.message}`);
      });
  };

  useEffect(() => {
    const images: HTMLElement[] = [];
    const imgSources = [cartonFull, carton, fusion, pomme, raisin];
  
  
    const handleClick = (event: MouseEvent) => {
        images.forEach((image) => {
            const rect = image.getBoundingClientRect();
            const distance = Math.hypot(event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2);
            if (distance < 100) {
                image.remove();
            }
        });
    };
  
    document.body.addEventListener('click', handleClick);
  
    const addFallingImage = () => {
      let img = document.createElement("img");
      img.classList.add("falling-image");
      img.src = imgSources[Math.floor(Math.random() * imgSources.length)]; 
      img.style.left = `${Math.floor(Math.random() * (window.innerWidth - 100))}px`; 
      img.style.top = "-150px";  // Assure que l'image est générée hors de l'écran en haut
    
      images.push(img);
      document.body.appendChild(img);
    
      img.addEventListener("animationend", () => {
          img.remove();
      });
  };
  
  
    const intervalImage = setInterval(addFallingImage, Math.random() * ((5000/3) - (500/3)) + (500/3));
  
    return () => {
        clearInterval(intervalImage);
        images.forEach((img) => img.remove());
        document.body.removeEventListener('click', handleClick);
    };
  }, []);

  const handleAdminClick = () => {
    navigate("/Connexion_Admin");
  };


  return (
  
    <div style={{ position: 'relative', overflow: 'hidden',display: 'flex', flexDirection: 'column', height: '1000vh',width :'1000vh' , alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #f4f4f4, #e0e0e0)' }}>
      <button className="adminButton" onClick={handleAdminClick}>Admin connection</button>
      <h1 style={{ marginBottom: '40px', color: '#333', fontSize: '2.5em', fontFamily: 'Arial, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' , zIndex: '1'}}>Creation Admin Page</h1>
      <div style={{ zIndex: '10',  display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px', borderRadius: '15px', boxShadow: '0px 0px 20px rgba(0,0,0,0.15)', backgroundColor: '#fff', transition: 'transform 0.3s' }}
           onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
           onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      > 
      {message && <div style={{ color: 'red' }}>{message}</div>}
      <input
        type="text"
        placeholder="id_admin"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
        style={{ padding: '12px', fontSize: '18px', borderRadius: '7px', border: '1px solid #ddd', transition: 'border 0.3s, box-shadow 0.3s' }}
        onFocus={(e) => { e.target.style.border = '1px solid #007BFF'; e.target.style.boxShadow = '0px 0px 10px rgba(0,123,255,0.2)'; }}
        onBlur={(e) => { e.target.style.border = '1px solid #ddd'; e.target.style.boxShadow = 'none'; }}
      />
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: '12px', fontSize: '18px', borderRadius: '7px', border: '1px solid #ddd', transition: 'border 0.3s, box-shadow 0.3s' }}
        onFocus={(e) => { e.target.style.border = '1px solid #007BFF'; e.target.style.boxShadow = '0px 0px 10px rgba(0,123,255,0.2)'; }}
        onBlur={(e) => { e.target.style.border = '1px solid #ddd'; e.target.style.boxShadow = 'none'; }}
      />
      <input
        type="password"
        placeholder="mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: '12px', fontSize: '18px', borderRadius: '7px', border: '1px solid #ddd', transition: 'border 0.3s, box-shadow 0.3s' }}
        onFocus={(e) => { e.target.style.border = '1px solid #007BFF'; e.target.style.boxShadow = '0px 0px 10px rgba(0,123,255,0.2)'; }}
        onBlur={(e) => { e.target.style.border = '1px solid #ddd'; e.target.style.boxShadow = 'none'; }}
      />

      <button onClick={handleAdminRegister} style={{ padding: '12px 25px', fontSize: '18px', borderRadius: '7px', border: 'none', backgroundColor: '#28a745', color: '#fff', cursor: 'pointer', transition: 'background-color 0.3s, box-shadow 0.3s' }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#218838'; e.currentTarget.style.boxShadow = '0px 0px 15px rgba(40,167,69,0.3)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#28a745'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        S'inscrire
      </button>


      </div>
    </div>
  );
}

export default CreationAdminPage;



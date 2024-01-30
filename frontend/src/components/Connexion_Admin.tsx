import React, { useEffect, useContext,useState  } from 'react';
import './Connexion_Admin.css';
import { useNavigate } from 'react-router-dom';

import { Admin } from "../dto/Admin";
import { MyBlogContext } from "../MyBlogContext";
import { config } from "../config";
import { AdminService } from '../services/AdminService';






import cartonFull from '../image_jouflux/carton_full.png';
import carton from '../image_jouflux/carton.png';
import fusion from '../image_jouflux/fusion.png';
import pomme from '../image_jouflux/pomme.png';
import raisin from '../image_jouflux/raisin.png';





export function Connexion_Admin() {

  const context = useContext(MyBlogContext);

  const navigate = useNavigate();
  const [pseudo, setpseudo] = useState('');
  const [mdp, setmdp] = useState('');
  const adminService = new AdminService(config.API_URL);


  const handleLogin = () => {
    adminService.loginAdmin(pseudo, mdp)
      .then((u) => {
        localStorage.setItem("pseudo", pseudo);
        localStorage.setItem("sup_admin", u.data.SUP_AD);
        const admin = {
          admin: pseudo,
          sup_admin : u.data.SUP_AD
        };
        context.setAdmin(admin);
        navigate("/adminpage")
      })
      .catch(error => {
        // Vérifiez si l'erreur contient une réponse et un statut
        if (error.response && error.response.status) {
          switch (error.response.status) {
            case 404:
              alert("Admin n'existe pas");
              break;
            case 400:
              alert("Mot de passe incorrect");
              break;
            case 500:
              alert("Erreur lors de la connexion à la base de données");
              break;
            default:
              alert("Une erreur inconnue est survenue");
          }
        } else {
          // Si l'erreur n'a pas de réponse associée ou de statut, affichez un message générique
          alert("Une erreur est survenue lors de la connexion");
        }
      });
  };

  const handlecreer = () => {
    navigate("/CreationAdminPage");
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
    navigate("/Login");
  };

  const handleForgotPasswordClick = () => {
    navigate('/PageMdpforgot'); // Mettez ici le chemin de votre choix
  };


  return (
  
    <div style={{ position: 'relative', overflow: 'hidden',display: 'flex', flexDirection: 'column', height: '1000vh',width :'1000vh' , alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #f4f4f4, #e0e0e0)' }}>
      <button className="adminButton" onClick={handleAdminClick}>Players connection</button>
      <h1 style={{ marginBottom: '40px', color: '#333', fontSize: '2.5em', fontFamily: 'Arial, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' , zIndex: '1'}}>Connexion Admin</h1>
      <div style={{ zIndex: '1',  display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px', borderRadius: '15px', boxShadow: '0px 0px 20px rgba(0,0,0,0.15)', backgroundColor: '#fff', transition: 'transform 0.3s' }}
           onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
           onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <input
          type="text"
          placeholder="Id admin"
          value={pseudo}
          onChange={(e) => setpseudo(e.target.value)}
          style={{ padding: '12px', fontSize: '18px', borderRadius: '7px', border: '1px solid #ddd', transition: 'border 0.3s, box-shadow 0.3s' }}
          onFocus={(e) => { e.target.style.border = '1px solid #007BFF'; e.target.style.boxShadow = '0px 0px 10px rgba(0,123,255,0.2)'; }}
          onBlur={(e) => { e.target.style.border = '1px solid #ddd'; e.target.style.boxShadow = 'none'; }}
        />
        <input
          type="password"
          placeholder="Mdp admin"
          value={mdp}
          onChange={(e) => setmdp(e.target.value)}
          style={{ padding: '12px', fontSize: '18px', borderRadius: '7px', border: '1px solid #ddd', transition: 'border 0.3s, box-shadow 0.3s' }}
          onFocus={(e) => { e.target.style.border = '1px solid #007BFF'; e.target.style.boxShadow = '0px 0px 10px rgba(0,123,255,0.2)'; }}
          onBlur={(e) => { e.target.style.border = '1px solid #ddd'; e.target.style.boxShadow = 'none'; }}
        />


        <button onClick={handleLogin} style={{ padding: '12px 25px', fontSize: '18px', borderRadius: '7px', border: 'none', backgroundColor: '#007BFF', color: '#fff', cursor: 'pointer', transition: 'background-color 0.3s, box-shadow 0.3s' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0056b3'; e.currentTarget.style.boxShadow = '0px 0px 15px rgba(0,123,255,0.3)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#007BFF'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Se connecter
        </button>

        <button onClick={handlecreer} style={{ padding: '12px 25px', fontSize: '18px', borderRadius: '7px', border: 'none', backgroundColor: '#28a745', color: '#fff', cursor: 'pointer', transition: 'background-color 0.3s, box-shadow 0.3s' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#218838'; e.currentTarget.style.boxShadow = '0px 0px 15px rgba(40,167,69,0.3)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#28a745'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Créer un compte
        </button>
        <div className="incase" onClick={handleForgotPasswordClick} >
        Mot de passe oublié<br/>
        </div>


      </div>
    </div>
  );
}

export default Connexion_Admin;



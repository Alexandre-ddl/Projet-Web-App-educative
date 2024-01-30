import React, { useEffect, useContext,useState  } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

import { User } from "../dto/User";
import { MyBlogContext } from "../MyBlogContext";
import { config } from "../config";
import { UserService } from '../services/UserService';






import cartonFull from '../image_jouflux/carton_full.png';
import carton from '../image_jouflux/carton.png';
import fusion from '../image_jouflux/fusion.png';
import pomme from '../image_jouflux/pomme.png';
import raisin from '../image_jouflux/raisin.png';





export function PageMdpforgot() {
  const context = useContext(MyBlogContext);

  const navigate = useNavigate();
  const [groupId, setGroupId] = useState('');
  const [pseudo, setPseudo] = useState('');

  const userService = new UserService(config.API_URL);

  const handleRegister = () => {
    userService.registerUser(groupId,pseudo).then((u) => {
      console.log("bien entrer")
      if(u.data.status ==="success"){
        localStorage.setItem("id_player", pseudo);
        localStorage.setItem("id_equipe", groupId);
        const user: User = {
          id_equipe: groupId,
          id_player: pseudo,

        };
        context.setUser(user);
        if (user.id_equipe === "Admin"){
          console.log("adminpage")
          navigate('/adminpage');
        }else {
          console.log("jobSelection")
          navigate('/jobSelection');
        }
        
      } else {
        alert('Erreur lors de la connexion. Vérifiez l\'identifiant de l\'équipe ou réessayez plus tard.');
      }})
      .catch(error => {
        alert('Une erreur est survenue lors de la connexion au serveur. Veuillez réessayer plus tard.');
      });
      };
    

  const handlelogin = () => {
    userService.loginUser(groupId,pseudo).then((u) => {
      localStorage.setItem("id_player", pseudo);
      localStorage.setItem("id_equipe", groupId);
      const user: User = {
        id_equipe: groupId,
        id_player: pseudo,
        
      };
      context.setUser(user);
      if (user.id_equipe === "Admin"){
        navigate('/adminpage');
        console.log("adminpage")
      } else {
        console.log("autre")
      switch(u.data.action) {
          case "startGameAnyway":
              navigate('/gameInProgress');
              break;
          case "onSelectJob":
              navigate('/counter');
              break;
          case "onLogin":
              navigate('/jobSelection');
              break;
          default:
              alert('Une action inattendue a été reçue.');
      }
      }    
    })
    .catch(error => {
        alert('Une erreur est survenue lors de la connexion au serveur. Veuillez réessayer plus tard.');
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
      <h1 style={{ marginBottom: '40px', color: '#333', fontSize: '2.5em', fontFamily: 'Arial, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' , zIndex: '1'}}>E-mail oublié</h1>
      <div style={{ zIndex: '1',  display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px', borderRadius: '15px', boxShadow: '0px 0px 20px rgba(0,0,0,0.15)', backgroundColor: '#fff', transition: 'transform 0.3s' }}
           onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
           onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      > 
        <input
          type="text"
          placeholder="E-mail"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          style={{ padding: '12px', fontSize: '18px', borderRadius: '7px', border: '1px solid #ddd', transition: 'border 0.3s, box-shadow 0.3s' }}
          onFocus={(e) => { e.target.style.border = '1px solid #007BFF'; e.target.style.boxShadow = '0px 0px 10px rgba(0,123,255,0.2)'; }}
          onBlur={(e) => { e.target.style.border = '1px solid #ddd'; e.target.style.boxShadow = 'none'; }}
        />
        
        <button onClick={handleRegister} style={{ padding: '12px 25px', fontSize: '18px', borderRadius: '7px', border: 'none', backgroundColor: '#28a745', color: '#fff', cursor: 'pointer', transition: 'background-color 0.3s, box-shadow 0.3s' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#218838'; e.currentTarget.style.boxShadow = '0px 0px 15px rgba(40,167,69,0.3)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#28a745'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Envoyer
        </button> 


      </div>
    </div>
  );
}

export default PageMdpforgot;



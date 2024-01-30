import React, { useState ,useContext ,  useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import CounterPage from './CounterPage';
import JobSelectionPage from './JobSelectionPage';
import GameInProgress from './GameInProgress';
import SupAdminPage from './SupAdminPage';
import PartiePage from './PartiePage';
import Connexion_Admin from './Connexion_Admin'
import PageMdpforgot from './PageMdpforgot'
import KPIPageALLTeam from './KPIPageALLTeam'
import CreationAdminPage from './CreationAdminPage'
import TeamContentPage from './TeamContentPage'




import PrivateRoute from "./PrivateRoute";
import { MyBlogContext } from "../MyBlogContext";
import { User } from "../dto/User";
import { Admin } from "../dto/Admin";
import { config } from "../config";
import { UserService } from "../services/UserService";
import AdminPage from './AdminPage';
import KPIPage from './KPIPage';


function App() {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);


  useEffect(() => {
    const id_player = localStorage.getItem("id_player");
    const id_equipe = localStorage.getItem("id_equipe");
    const pseudo= localStorage.getItem("pseudo");
    const supad = localStorage.getItem("sup_admin") === 'true';

    if (id_player && id_equipe) {
      const userService = new UserService(config.API_URL);
      userService.getUser(id_equipe,id_player).then((u) => {
        if (u.data) {
          
          setUser(u.data);


        }
      });
      }
      
      
      if (pseudo ) {
 
        const ad: Admin = {
          admin : pseudo,
          sup_admin : supad ,
       };
       setAdmin(ad)

      }


    
  }, [setUser, setAdmin]  );



  return (
    <MyBlogContext.Provider value={{ user, setUser , admin , setAdmin }}>
      <Router>
        <Routes>
        <Route 
          path="/login" 
          element={<LoginPage></LoginPage>}
        />
        <Route
          path="/jobSelection"
          element={<PrivateRoute children={<JobSelectionPage></JobSelectionPage>} />}
        />
        <Route
          path="/counter"
          element={<PrivateRoute children={<CounterPage></CounterPage>} />}
        />
        <Route
          path="/gameInProgress"
          element={<GameInProgress></GameInProgress>}
        />

        <Route
          path="/adminpage"
          element={<AdminPage/>}
        />

        <Route
          path="/super-admin-page"
          element={<SupAdminPage/>}
        />  
        
        <Route
          path="/kpi/:id_equipe/:page"
          element={<KPIPage/>}
        />  

     
        <Route path="/TeamContentPage/:id_equipe/:pseudo_equipe" element={<TeamContentPage />} />


        <Route 
        path="/partie-equipes/:idPartie/:NomPartie" 
        element={<PartiePage />} />

        <Route
          path="/Connexion_Admin"
          element={<Connexion_Admin/>}
        /> 

        <Route
          path="/PageMdpforgot"
          element={<PageMdpforgot/>}
        />
        
        <Route 
        path="/kpi-all-team/:idPartie/:NomPartie" 
        element={<KPIPageALLTeam />} />

<Route
          path="/CreationAdminPage"
          element={<CreationAdminPage/>}
        />
        

        {/* Redirigez vers la page de connexion par défaut */}
        <Route 
          path="*" 
          element={<LoginPage></LoginPage>}
        />
        </Routes>
      </Router>
    </MyBlogContext.Provider>
  );
}

export default App;




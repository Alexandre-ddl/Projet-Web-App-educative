import React, { useEffect } from "react";
import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import "./TeamContentPage.css";
import descriptionRole from '../image_jouflux/descriptionRole.png';
import { UserService } from "../services/UserService";
import { config } from "../config";

interface Role {
  id: number;
  name: string;
  user: string;
  description: string;
}




export default function TeamContentPage() {
  const { id_equipe,  pseudo_equipe } = useParams();
  const idequipe = id_equipe
  const NomEquipe = pseudo_equipe
  const navigate = useNavigate();
  console.log("test",idequipe,  NomEquipe)
  const teamDetails = {
    id: 1,
    name: NomEquipe,
    roles: [
      { id:'1',name:'Rôle 1', user: 'Utilisateur A' , description: 'Description rôle 1'},
      { id:'2',name: 'Rôle 2', user: 'Utilisateur B' , description: 'Description rôle 2' },
      { id:'3',name: 'Rôle 3', user: 'Utilisateur C' , description: 'Description rôle 3'},
      { id:'4',name: 'Rôle 4', user: 'Utilisateur D' , description: 'Description rôle 4'},
      { id:'5',name: 'Rôle 5', user: 'Utilisateur E' , description: 'Description rôle 5'},
    ],
  };
  
  const [roles, setRoles] = useState(teamDetails.roles);
  const userService = new UserService(config.API_URL)
  const fetchUsers = () => {
    roles.forEach((role) => {
      idequipe && userService.getroleUser(idequipe, role.id.toString())
        .then((u) => {
          const user = u.data; // Extract data from the Axios response
          console.log(u);
          setRoles((prevRoles) => prevRoles.map((r) => 
            r.id === role.id ? { ...r, 
             user } : r
          ));
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
 };
  useEffect(() => {
    fetchUsers();
    getusers();
   }, []);

   
   
   const getusers = () => {
    idequipe && userService.getteamplayer(idequipe, 'filler')
        .then((response) => {
            console.log(response)
            setUser(response.data) // response.data should contain the array of strings
        })
}

  const [users,setUser] = useState<[]|null>(null);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [assigningUser, setAssigningUser] = useState<string | null>(null);
  const [confirmAssign, setConfirmAssign] = useState<{ roleId: string, newUser: string } | null>(null);
  const [confirmUnassign, setConfirmUnassign] = useState<{ roleId: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const navigate = useNavigate();

  const handleAssignClick = (roleId: string) => {
    setAssigningUser(roleId.toString());
  };

  const handleAssignRole = (roleId: string, newUser: string) => {
    setConfirmAssign({ roleId, newUser });
  };

  const confirmRoleAssignment = () => {
    if (confirmAssign) {
      setRoles(roles.map(role => 
        role.id === confirmAssign.roleId ? { ...role, user: confirmAssign.newUser } : role
      ));
      setConfirmAssign(null);
      setAssigningUser(null);
    }
  };

  const cancelRoleAssignment = () => {
    setConfirmAssign(null);
  };

  const handleUnassignRole = (roleId: string) => {
    setRoles(roles.map(role => 
      role.id === roleId ? { ...role, user: '' } : role
    ));
  };

  const confirmUnassignRole = () => {
    if (confirmUnassign) {
       setRoles(roles.map(role => 
         role.id === confirmUnassign.roleId ? { ...role, user: '' } : role
       ));
       setConfirmUnassign(null);
    }
   };

   const cancelUnassignRole = () => {
    setConfirmUnassign(null);
   };

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
  };

  //const handleKPIclick = () => {
   //navigate('/KPI');
  //};

  const handleCloseDescription = () => {
    setSelectedRole(null);
  };

  const KPIpage = () => {
    navigate(`/kpi/${id_equipe}/${1}`); 
  };
  //const giveRole = () => {
    //idequipe && confirmAssign && userService.giveroleUser(confirmAssign.roleId.toString(),idequipe,confirmAssign.newUser).then(() => {
        //fetchUsers();
   // });
//}


  return (
    <div className="team-content-container">
      <h1>Détails de l'{NomEquipe}</h1>
      <div className="roles-container">
        {roles.map((role) => (
          <div key={role.id} className="role-item">
            <p>{role.id}</p>
            <p>Attribué à : {role.user || 'Personne'}</p>
            {assigningUser === role.id.toString() ? (
              <>
                <select onChange={(e) => handleAssignRole(role.id, e.target.value)} value={role.user}>
                  <option value="">Choisir un utilisateur</option>
                  {users && users.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
                {role.user && <button onClick={() => handleUnassignRole(role.id)}>Supprimer</button>}
              </>
            ) : role.user ? (
              <button onClick={() => handleUnassignRole(role.id)}>Supprimer</button>
            ) : (
              <button onClick={() => handleAssignClick(role.id)}>Attribuer</button>
            )}
          </div>
        ))}
      </div>
      {confirmUnassign && (
        <div className="confirm-unassign">
          <p>Êtes-vous sûr(e) de vouloir supprimer l'utilisateur du  {confirmUnassign.roleId} ?</p>
          <button onClick={confirmUnassignRole}>Valider</button>
          <button onClick={cancelUnassignRole}>Annuler</button>
        </div>
      )}
      {confirmAssign && (
        <div className="confirm-assign">
          <p>Êtes-vous sûr(e) d'affecter le {roles.find(r => r.id === confirmAssign.roleId)?.id} à {confirmAssign.newUser}?</p>
          <button onClick={confirmRoleAssignment}>Valider</button>
          <button onClick={cancelRoleAssignment}>Annuler</button>
        </div>
      )}
      <button className="kpi-button" onClick={KPIpage} >KPI</button>
    </div>
  );}
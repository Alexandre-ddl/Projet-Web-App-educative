import React, { useState, useContext } from 'react';
import './JobSelectionPage.css';

import { useNavigate } from 'react-router-dom';

import { User } from "../dto/User";
import { config } from "../config";
import { MyBlogContext } from "../MyBlogContext";
import { UserService } from '../services/UserService';


  


export function JobSelectionPage() {
  const { user , setUser } = useContext(MyBlogContext);
  const userService = new UserService(config.API_URL);
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  user && console.log("test",user.id_equipe.toString(),user.id_player)
  const handleJobSelection = (jobId: number) => {
    user && console.log("API ",user.id_equipe,user.id_player,jobId)
    user && userService.jobUser(user.id_equipe,user.id_player,jobId).then((u) => {
        if (u.data.status === 'Rôle mis à jour avec succès') {
            setSelectedJob(jobId); 
            setUser({ ...user, id_role: [jobId] })
            navigate('/counter'); 
        } else {
            alert('Erreur lors de la mise à jour du rôle.');
        }
    })
    .catch(error => {
        alert('Erreur lors de la mise à jour du rôle. Veuillez réessayer plus tard.');
    });
  }

  const jobs = [
    { id: 1, title: 'Job 1', description: 'Description for Job 1' },
    { id: 2, title: 'Job 2', description: 'Description for Job 2' },
    { id: 3, title: 'Job 3', description: 'Description for Job 3' },
    { id: 4, title: 'Job 4', description: 'Description for Job 4' },
    { id: 5, title: 'Job 5', description: 'Description for Job 5' },
  ];
 
    return (
      <div className="job-selection-container">
        {jobs.map((job) => (
          <div
          key={job.id}
          className={`job-card ${selectedJob === job.id ? 'selected' : ''}`}
          onMouseEnter={() => setSelectedJob(job.id)}
          onMouseLeave={() => setSelectedJob(null)}
          onClick={() => handleJobSelection(job.id)}  // Modifié pour passer l'ID du job
      >
          <h3>{job.title}</h3>
          {selectedJob === job.id && (
              <div className="job-description">
                  <p><strong>Contexte:</strong> {job.description}</p>
                  <p><strong>Contrainte:</strong> {job.description}</p>
                  <p><strong>Formule:</strong> {job.description}</p>
              </div>
          )}
      </div>
        ))}
      </div>
    );

}

export default JobSelectionPage;


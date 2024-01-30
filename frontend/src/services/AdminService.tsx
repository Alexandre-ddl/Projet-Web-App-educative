import axios, {AxiosInstance} from 'axios'
import { User } from '../dto/User';

export class AdminService {

    private apiUrl: string;
    private axiosInstance: AxiosInstance;
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
        this.axiosInstance = axios.create({baseURL: this.apiUrl})
    }

    loginAdmin(pseudo: string,mdp: string ){
        return this.axiosInstance.post('/login-admin', {pseudo , mdp });
    }

    getAdminParties(admin_id: string) {
        return this.axiosInstance.get(`/get_parties/${admin_id}`);
    }
    createPartie(
        id_admin: string, 
        nom: string, 
        nbr_equipes: number, 
        demandesClient: Record<number, number>
      ) {
        // Convertir demandesClient en format approprié pour l'API
        const demandeClient = Object.fromEntries(
            Object.entries(demandesClient).map(([jour, q_demande]) => [Number(jour), q_demande])
        );
      
        // Préparer la charge utile de la requête pour correspondre à l'attente de l'API
        const payload = {
            id_admin, 
            nom,
            nbr_equipes,
            demande_client: demandeClient,
        };
      
        // Envoi de la requête POST à l'API
        return this.axiosInstance.post('/nouvelle_partie', payload);
      }

      registerAdmin(pseudo: string, email: string, mdp: string) {
        // console.log({
        //     pseudo: pseudo,
        //     email: email,
        //     mdp: mdp
        // })
        return this.axiosInstance.post('/register-admin', {
            pseudo: pseudo,
            email: email,
            mdp: mdp
        });
    }
      
    
}
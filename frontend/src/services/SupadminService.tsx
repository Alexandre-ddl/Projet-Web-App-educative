import axios, {AxiosInstance} from 'axios'
import { User } from '../dto/User';

export class SupadminService {

    private apiUrl: string;
    private axiosInstance: AxiosInstance;
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
        this.axiosInstance = axios.create({baseURL: this.apiUrl})
    }
    
    getAdmins() {
        return this.axiosInstance.get('/admins');;
    }

    getPartiesByAdmin(pseudo: string) {
        return this.axiosInstance.get(`/admins/Partie`, { params: { pseudo } });
    }

    deleteAdmin(pseudo: string) {
        return this.axiosInstance.delete(`/admins/${pseudo}`);
    }

    give_SP(pseudo: string) {
        return this.axiosInstance.put(`/admins/${pseudo}`);
    }

    deleteParties(pseudo: string, checkedParties: { [key: string]: boolean }) {
        const formattedCheckedParties = Object.entries(checkedParties)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
    
        return this.axiosInstance.delete(`/delete-parties`, { params: { pseudo, formattedCheckedParties } });
    }
    
    
}
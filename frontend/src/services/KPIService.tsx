import axios, {AxiosInstance} from 'axios'
import { User } from '../dto/User';

export class KPIService {

    private apiUrl: string;
    private axiosInstance: AxiosInstance;
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
        this.axiosInstance = axios.create({baseURL: this.apiUrl})
    }
    

    get_infos_equipe(pseudo: string) {
        return this.axiosInstance.get(`/equipe-info/${pseudo}`);
    }
    get_all_equipe_info(id_partie : number) {
        return this.axiosInstance.get(`/all_equipe-info/${id_partie}`);
    }
}
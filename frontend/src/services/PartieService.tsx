import axios, {AxiosInstance} from 'axios'
import {Partie} from '../dto/Partie'
import {Equipe} from '../dto/Equipe'

export class PartieService {

    private apiUrl: string;
    private axiosInstance: AxiosInstance;
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
        this.axiosInstance = axios.create({baseURL: this.apiUrl})
    }

    addTeam(id_admin: string,id_partie: string ) {
        return this.axiosInstance.put<Equipe>('/partie/addTeam', {id_admin,id_partie});
    }
    
    getTeams(id_admin: string,id_partie: string ) {
        return this.axiosInstance.post<{teamId: string, playerCount: number}[]>('/partie/getTeams', {id_admin,id_partie});
    }

    deletePartie(id_partie: number) {
        return this.axiosInstance.delete(`/partie/${id_partie}`);
    }

    
}
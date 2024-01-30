import axios, {AxiosInstance} from 'axios'
import { User } from '../dto/User';

export class UserService {

    private apiUrl: string;
    private axiosInstance: AxiosInstance;
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
        this.axiosInstance = axios.create({baseURL: this.apiUrl})
    }
    
    getUser(id_equipe: string,id_player: string ) {
        return this.axiosInstance.post<User>('/users/roles', {id_equipe , id_player });
    }

    registerUser(id_equipe: string,id_player: string ){
        return this.axiosInstance.post('/register', {id_equipe , id_player });
    }

    loginUser(id_equipe: string,id_player: string ){
        return this.axiosInstance.post('/login', {id_equipe , id_player });
    }

    jobUser(id_equipe: string, id_player: string, id_role: number) {
        console.log('AXIOs', id_equipe, id_player, id_role )
        return this.axiosInstance.put('/player/role', { id_equipe, id_player, id_role });
    }
    

    request_game_startUser(id_equipe: string,id_player: string){
        console.log(id_equipe,id_player,)
        return this.axiosInstance.put('/request_game_start', {id_equipe , id_player});
    }

    connectedUser(id_equipe: string,id_player: string){
        return this.axiosInstance.post('/team/members', {id_equipe , id_player});
    }

    cliqueboutonUser(id_equipe: string,id_player: string){
        return this.axiosInstance.post('/clique_bouton_start', {id_equipe , id_player});
    }

    playerreadinessUser(id_equipe: string){
        return this.axiosInstance.post('/check_all_players_ready', {id_equipe});
    }

    asignroleUser(id_equipe: string,id_player: string){
        return this.axiosInstance.post('/assign_roles', {id_equipe,id_player});
    }

    join_game(nom_partie: string ,groupId : string ,pseudo : string ){
        return this.axiosInstance.post('/join_game', {nom_partie,groupId,pseudo});
    }

    login_game(nom_partie: string ,groupId : string ,pseudo : string ){
        return this.axiosInstance.post('/login_game', {nom_partie,groupId,pseudo});
    }

    getroleUser(id_equipe:string,id_role:string){
        return this.axiosInstance.post('/partie/getRoleplayer', {id_equipe,id_role}); 
    }
    getteamplayer(id_equipe:string,id_partie:string){
        return this.axiosInstance.post('/team/getplayer', {id_equipe,id_partie}); 
    }
    get_stock_var(id_equipe:string) {
        console.log(id_equipe);
        return this.axiosInstance.get(`/get_stock_var/${id_equipe}`);
    }
    
    add_equipe_info(id_equipe: string,
                    jour: number,
                    q_prod_caps_magique: number,
                    q_prod_boite_magique: number,
                    q_vendu_boite_magique: number,
                    q_commande_raisin: number,
                    q_commande_pomme: number,
                    q_commande_carton: number,){

        console.log(id_equipe,jour,
            q_prod_caps_magique,
            q_prod_boite_magique,
            q_vendu_boite_magique,
            q_commande_raisin,
            q_commande_pomme,
            q_commande_carton)
        return this.axiosInstance.post('/add_equipe_info', {
            id_equipe,
            jour,
            q_prod_caps_magique,
            q_prod_boite_magique,
            q_vendu_boite_magique,
            q_commande_raisin,
            q_commande_pomme,
            q_commande_carton
        }); 
    }


}
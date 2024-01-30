from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime , timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from typing import Optional , Dict
from db_mapping import *

import jwt

from fastapi.security import HTTPBearer


import psycopg2
from psycopg2 import sql

from sqlalchemy.orm import Session

origins = ["http://localhost:3000", "http://localhost:3001","http://localhost:3002", "http://localhost:9456","http://localhost:8000"]

class PartiesModel(BaseModel):
    id_admin:str
    id_partie:str 

class CommandeClientModel(BaseModel):
    jour: int
    q_demande_boite_magique: int

class EquipesModel(BaseModel):
    id_equipe: str


class Equipe_infosModel(BaseModel):
    id_equipe: str
    jour: int
    q_prod_caps_magique: int
    q_prod_boite_magique: int
    q_vendu_boite_magique: int
    q_commande_raisin: int
    q_commande_pomme: int
    q_commande_carton: int

class PlayerModel(BaseModel):
    id_equipe: str
    id_player: str
    
    
class Player_statesModel(BaseModel):
    id_player : str
    id_equipe : str
    action : bool
    created_at: datetime 

class Players_rolesModel(BaseModel): 
    id_player : str
    id_equipe : str
    id_role : int
 

class RoleModel(BaseModel):
    id_role: int
    content: str



class PartieInput(BaseModel):
    id_admin: str
    nom: str
    nbr_equipes: int
    demande_client: Dict[int, int]


class AdminConnection(BaseModel):
    pseudo: str
    mdp: str

class AdminModel(BaseModel):
    pseudo: str
    email: str
    mdp : str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#######################
####### TOKEN #########
#######################


SECRET_KEY = "my_secret_key"  # Changez cela par une clé secrète solide et unique
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


########## FIN TOKEN ##########


dm = DatabaseManagement("jouflux", True)


@app.post("/register")
async def register(data: PlayerModel):

    # Utilisation d'une connexion avec psycopg2
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:
        # Vérifiez si l'identifiant de l'équipe existe
        select_sql = "SELECT id_equipe FROM equipes WHERE id_equipe = %s"
        cur.execute(select_sql, (data.id_equipe,))
        equipe_id = cur.fetchone()
        if not equipe_id:
            raise HTTPException(status_code=404, detail="Équipe non trouvée")
        if data.id_equipe == "Admin":
            return {"status": "unsuccess"}
        # Insérez le pseudo du joueur dans la table associée
        insert_sql = "INSERT INTO players (id_player, id_equipe) VALUES (%s, %s)"
        cur.execute(insert_sql, (data.id_player, equipe_id[0]))
        conn.commit()
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()

    return {"status": "success"}



@app.post("/login")
async def login(data: PlayerModel):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:
        # Vérifiez si l'identifiant de l'équipe et l'identifiant du joueur existent dans la table players
        print(data.id_equipe, data.id_player)
        select_sql = "SELECT id_equipe FROM players WHERE id_equipe = %s AND id_player = %s"
        cur.execute(select_sql, (data.id_equipe, data.id_player))
        player_exists = cur.fetchone()
        print(player_exists)

        if not player_exists:
            raise HTTPException(status_code=404, detail="Joueur non trouvé")

        # Vérifiez si l'équipe a stats = true
        select_sql = "SELECT stats FROM equipes WHERE id_equipe = %s"
        cur.execute(select_sql, (data.id_equipe,))
        stats = cur.fetchone()

        if stats and stats[0]:
                  
            return {"status": "success", "action": "startGameAnyway"}

        # Vérifiez si le joueur possède déjà un id_role dans la base
        select_sql = "SELECT id_role FROM players_roles WHERE id_player = %s AND id_equipe = %s"
        cur.execute(select_sql, (data.id_player, data.id_equipe))
        role_exists = cur.fetchone()

        if role_exists:
           
            return {"status": "success", "action": "onSelectJob"}

        # Sinon, renvoyez vers la page de connexion
        
        return {"status": "success", "action": "onLogin"}

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()



@app.post("/login-admin")
async def login(data: AdminConnection):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:
        print("ok")
        cur.execute('SELECT pseudo, _mdp_hash , "SUP_AD" FROM admins WHERE pseudo = %s', (data.pseudo,))
        admin = cur.fetchone()
        print(admin)
        if admin is None:
            raise HTTPException(status_code=404, detail="Admin n'existe pas")
        # À remplacer par une vérification de hash sécurisée dans un cas réel
        print("ok")
        print(admin[1])
        if admin[1] != data.mdp:
            raise HTTPException(status_code=400, detail="Mot de passe incorrect")
        print("ok")
        return {"status": "success","SUP_AD":admin[2]}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail="Erreur lors de la connexion à la base de données")
    finally:
        cur.close()
        conn.close()


@app.post("/users/roles")
async def get_user_roles(data: PlayerModel):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:
        # Interroger la base de données pour obtenir les id_roles
        cur.execute("SELECT id_role FROM players_roles WHERE id_player = %s AND id_equipe = %s", (data.id_player, data.id_equipe))
        roles = cur.fetchall()

        # Transformer les résultats en un tableau d'id_roles
        id_roles = [role[0] for role in roles]

        return {"id_player": data.id_player, "id_equipe": data.id_equipe, "id_role": id_roles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
    

class selectRole(BaseModel):
    id_equipe: str
    id_player: str
    id_role : int




@app.put("/player/role")
async def update_role(data : selectRole):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    print("inside")
    try:
        print(data.id_equipe, data.id_role)
        # Vérifiez si le rôle est déjà pris par un autre membre de l'équipe
        select_role_sql = "SELECT id_player FROM players_roles WHERE id_equipe = %s AND id_role = %s"
        cur.execute(select_role_sql, (data.id_equipe, data.id_role))
        player_with_role = cur.fetchone()
        print("ok")
        if player_with_role:
            raise HTTPException(status_code=400, detail="Rôle déjà pris par un autre membre de l'équipe")

        # Mettez à jour le rôle du joueur
        insert_sql = "INSERT INTO players_roles (id_player, id_equipe,id_role) VALUES (%s, %s,%s)"
        cur.execute(insert_sql, (data.id_player,data.id_equipe,data.id_role))
        print("ok")
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Joueur non trouvé")

        conn.commit()
        return {"status": "Rôle mis à jour avec succès"}

    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()


@app.post("/team/members")
async def get_team_members(data: PlayerModel):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:
        select_sql = "SELECT id_player FROM players_states WHERE id_equipe = %s ORDER BY CASE WHEN id_player = %s THEN 0 ELSE 1 END"
        cur.execute(select_sql, (data.id_equipe, data.id_player))
        players = [player[0] for player in cur.fetchall()]
        return {"players": players}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()


@app.put("/request_game_start")
async def request_game_start(data: PlayerModel):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    try:
        print(data.id_player,data.id_equipe)
        cur.execute("INSERT INTO players_states (id_player, id_equipe, action, created_at) VALUES (%s, %s, FALSE, NOW())", (data.id_player, data.id_equipe))
        print("ok")
        conn.commit()
        print("ok")
    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()


@app.post("/clique_bouton_start")
async def update_game_start_request(data: PlayerModel):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    try:
        cur.execute(
            """
            UPDATE players_states 
            SET action = TRUE 
            WHERE id_player = %s AND id_equipe = %s
            """, 
            (data.id_player, data.id_equipe)
        )
        conn.commit()
    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()
    return {"status": "success"}


@app.post("/check_all_players_ready")
async def check_all_players_ready(data: EquipesModel):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    try:
        # Comptez combien de joueurs dans cette équipe ont `action` égale à `false`
        cur.execute(
            """
            SELECT COUNT(*) 
            FROM players_states 
            WHERE id_equipe = %s AND action = FALSE
            """, 
            (data.id_equipe,)
        )
        not_ready_players = cur.fetchone()[0]

        # Si aucun joueur n'a `action` à `false`, alors tous sont prêts
        if not_ready_players == 0:
            return {"status": "success","value":True}
        else:
            return {"status": "pending","value":False}

    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()



import random

@app.post("/assign_roles")
async def assign_roles(data: PlayerModel):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    
    try:
        id_equipe = data.id_equipe

        cur.execute("SELECT id_player FROM players_states WHERE id_equipe = %s ORDER BY created_at", (id_equipe,))
        players = cur.fetchall()

        # Check if the current player is the first player
        current_player_id = data.id_player  # Assuming this information is available in the request data
        if players[0][0] != current_player_id:
            return {"status": "fail", "message": "You are not the main player to assign roles."}

        if len(players) < 5:
            cur.execute("SELECT id_role FROM players_roles WHERE id_equipe = %s", (id_equipe,))
            existing_roles = {role[0] for role in cur.fetchall()}
            missing_roles = set(range(1, 6)) - existing_roles

            # Assign roles based on the number of players
            if len(players) == 1:
                for role in missing_roles:
                    cur.execute("INSERT INTO players_roles (id_player, id_equipe, id_role) VALUES (%s, %s, %s)", (players[0][0], id_equipe, role))
            else:
                players_to_assign = random.sample(players, len(players))
                for player in players_to_assign:
                    role = missing_roles.pop()
                    cur.execute("INSERT INTO players_roles (id_player, id_equipe, id_role) VALUES (%s, %s, %s)", (player[0], id_equipe, role))
                    if len(players) in [2, 3] and len(missing_roles) > 0:
                        role = missing_roles.pop()
                        cur.execute("INSERT INTO players_roles (id_player, id_equipe, id_role) VALUES (%s, %s, %s)", (player[0], id_equipe, role))

            cur.execute(
                """
                UPDATE equipes 
                SET stats = TRUE 
                WHERE id_equipe = %s
                """, 
                (data.id_equipe,)
            )
            conn.commit()

        return {"status": "success", "message": "Roles assigned successfully!"}

    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()



@app.post("/add_equipes_info_jour")
async def add_equipes_info(data : EquipesModel):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    #print("ok")
    try:
        # Trouver le dernier jour pour l'id_equipe donné
        cur.execute("SELECT MAX(jour) FROM equipe_info WHERE id_equipe = %s", (data.id_equipe,))
        latest_day_result = cur.fetchone()
        latest_day = latest_day_result[0] if latest_day_result and latest_day_result[0] is not None else 0
        print(latest_day)
        # Calculer le nouveau jour
        new_day = latest_day + 1
        

        # Insérer une nouvelle ligne avec le nouveau jour
        insert_sql = """
        INSERT INTO equipe_info (id_equipe, jour)
        VALUES (%s, %s)
        """
        cur.execute(insert_sql, (data.id_equipe, new_day,))
        #print("ok")
        conn.commit()

        return {"id_equipe": data.id_equipe, "latest_day": new_day}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()



from fastapi import  WebSocket, WebSocketDisconnect

team_connections = {}

@app.websocket("/ws/{team_id}")
async def websocket_endpoint(websocket: WebSocket, team_id: str):
    await websocket.accept()
    if team_id not in team_connections:
        team_connections[team_id] = []
    team_connections[team_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            # Créez une liste temporaire pour les connexions fermées
            closed_connections = []
            for connection in team_connections[team_id]:
                if connection is not websocket:
                    try:
                        await connection.send_text(data)
                    except RuntimeError:
                        # Ajoutez la connexion fermée à la liste temporaire
                        closed_connections.append(connection)
            # Supprimez les connexions fermées
            for connection in closed_connections:
                team_connections[team_id].remove(connection)
    except WebSocketDisconnect:
        team_connections[team_id].remove(websocket)


@app.get("/admins")
async def get_admins():
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:
        # Sélectionner pseudo et date_creation de tous les admins
        select_sql = "SELECT pseudo, date_creation FROM admins"
        cur.execute(select_sql)
        admins = [{"pseudo": admin[0], "date_creation": admin[1].strftime("%Y-%m-%d")} for admin in cur.fetchall()]
        return {"admins": admins}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()

@app.get("/admins/Partie")
async def get_parties_by_admin(pseudo: str):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:
        # Sélectionner id_partie et date_creation pour un admin spécifique
        select_sql = "SELECT nom, date_creation FROM parties WHERE id_admin = %s"
        cur.execute(select_sql, (pseudo,))
        parties = [{"pseudo": partie[0], "date_creation": partie[1].strftime("%Y-%m-%d")} for partie in cur.fetchall()]
        return {"parties": parties}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()


@app.delete("/admins/{pseudo}")
async def delete_admin(pseudo: str):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:
        # Vérifier si l'admin est un Super Admin
        check_sql = 'SELECT "SUP_AD" FROM admins WHERE pseudo = %s'
        cur.execute(check_sql, (pseudo,))
        result = cur.fetchone()
        print(result[0])
        if result[0]:  
            return {"message": "Impossible de supprimer c'est un Super Admin"}


        delete_sql = "DELETE FROM admins WHERE pseudo = %s"
        cur.execute(delete_sql, (pseudo,))
        conn.commit()
        return {"message": "Admin supprimé avec succès"}
    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()


@app.put("/admins/{pseudo}")
async def update_admin(pseudo: str):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:

        update_sql = 'UPDATE admins SET "SUP_AD" = true WHERE pseudo = %s'
        cur.execute(update_sql, (pseudo,))
        conn.commit()

        return {"message": f"{pseudo} devenu Super Admin"}
    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()


@app.delete("/delete-parties")
async def delete_parties(pseudo: str, formattedCheckedParties: str):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:
        # Vérifier si l'admin est un Super Admin
        check_sql = 'SELECT "SUP_AD" FROM admins WHERE pseudo = %s'
        cur.execute(check_sql, (pseudo,))
        result = cur.fetchone()
        if result[0]:  
            return {"message": "Impossible de supprimer c'est un Super Admin"}

        # Extract checkedParties from formattedCheckedParties
        checkedParties = {}
        for param in formattedCheckedParties.split('&'):
            key, value = param.split('=')
            checkedParties[key] = value

        for nom, is_checked in checkedParties.items():
            if is_checked == 'true':  # 'true' is a string, convert to boolean
                delete_partie_sql = 'DELETE FROM parties WHERE nom = %s AND id_admin = %s'
                cur.execute(delete_partie_sql, (nom, pseudo))

        conn.commit()

        return {"message": "Parties deleted successfully"}
    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cur.close()
        conn.close()

@app.get("/equipe-info/{id_equipe}")
async def get_equipe_info(id_equipe: str):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:
        # Sélectionner les informations de l'équipe et les commandes clients associées
        select_sql = """
        SELECT ei.jour, ei.q_prod_caps_magique, ei.q_prod_boite_magique, 
               ei.q_vendu_boite_magique, ei.q_commande_raisin, ei.q_commande_pomme, 
               ei.q_commande_carton, cc.q_demande_boite_magique as commande_client
        FROM equipe_info ei
        JOIN commande_client cc ON ei.jour = cc.jour
        WHERE ei.id_equipe = %s 
        """
        cur.execute(select_sql, (id_equipe,))
        equipe_infos = cur.fetchall()

        # Formater les résultats pour renvoyer un dictionnaire plus lisible
        results = []
        for info in equipe_infos:
            result = {
                'jour': info[0],  # Accès par index
                'q_prod_caps_magique': info[1],
                'q_prod_boite_magique': info[2],
                'q_vendu_boite_magique': info[3],
                'q_commande_raisin': info[4],
                'q_commande_pomme': info[5],
                'q_commande_carton': info[6],
                'commande_client': info[7]
            }
            results.append(result)

        if not results:
            raise HTTPException(status_code=404, detail="Informations non trouvées pour l'équipe spécifiée")
        return {"equipe_infos": results}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()

@app.post("/partie/getTeams")
async def get_teams(data: PartiesModel):
    # Utilisation d'une connexion avec psycopg2
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    try:
        # On trouve le nombre d'équipe de la partie
        select_sql = """
        SELECT e.pseudo_equipe, COUNT(p.id_player) as player_count
        FROM equipes e
        LEFT JOIN players p ON e.id_equipe = p.id_equipe
        WHERE e.id_partie = %s
        GROUP BY e.pseudo_equipe
        """
        cur.execute(select_sql, (data.id_partie,))

        teams = [{ "teamId": team[0], "playerCount": team[1]} for team in cur.fetchall()]
        return teams

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()

    return {"status": "success"}




@app.put("/partie/addTeam")
async def addTeam(data: PartiesModel):

    # Utilisation d'une connexion avec psycopg2
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    try:
        # Ontrouve le nombre d'équipe de la partie
        select_sql = "SELECT id_equipe FROM equipes WHERE id_partie = %s "
        cur.execute(select_sql,  (data.id_partie))
        teamlist = [teams[0] for teams in cur.fetchall()]
        nbequipe=len(teamlist)+1
        ide=str(data.id_partie)+"_Equipe"+ str(nbequipe)
        pseudo="Equipe"+ str(nbequipe)
         # Insérez l,équipe dans la table associée
        insert_sql = "INSERT INTO equipes (id_partie,id_equipe, pseudo_equipe,stats) VALUES (%s, %s,%s,%s)"
        cur.execute(insert_sql, (data.id_partie,ide,pseudo,False))
        conn.commit()

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()

    return {"status": "success"}


@app.get("/get_parties/{admin_id}")
async def get_admin_parties(admin_id: str):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:
        # Requête SQL pour obtenir les parties créées par l'admin
        print('ok')
        select_sql = "SELECT id_partie, nom, date_creation FROM parties WHERE id_admin = %s"
        cur.execute(select_sql, (admin_id,))
        print('ok')
        parties = cur.fetchall()
        return {"parties": [{"id_partie": partie[0], "nom": partie[1], "date_creation": partie[2]} for partie in parties]}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()



@app.post("/nouvelle_partie")
async def create_partie(partie: PartieInput):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    conn2 = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur2 = conn2.cursor()
    
    conn3 = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur3 = conn3.cursor()


    try:
        # Vérifier si le nom de la partie existe déjà pour cet id_admin
        cur.execute(
            "SELECT * FROM parties WHERE nom = %s AND id_admin = %s",
            (partie.nom, partie.id_admin)
        )
        if cur.fetchone():
            print('marche pas')
            return {"status": "error", "message": "Le nom de la partie existe déjà pour cet administrateur."}

        cur.execute(
            "INSERT INTO parties (id_admin, date_creation, nom) VALUES (%s, %s, %s) RETURNING id_partie",
            (partie.id_admin, datetime.now(), partie.nom)
        )
        id_partie_generated, = cur.fetchone()
        conn.commit()

        nom_concatene = f"{id_partie_generated}_{partie.nom}"
        cur.execute(
            "UPDATE parties SET conncetion_joueur = %s WHERE id_partie = %s",
            (nom_concatene, id_partie_generated)
        )
        conn.commit()

        # Créer les équipes et les insérer
        for i in range(1, partie.nbr_equipes + 1):
            id_equipe = f"{id_partie_generated}Equipe{i}"
            pseudo = f"Equipe{i}"
            cur2.execute(
                "INSERT INTO equipes (id_partie, id_equipe, pseudo_equipe, stats) VALUES (%s, %s, %s, FALSE)",
                (id_partie_generated, id_equipe, pseudo)
            )
        conn2.commit()

        # Insérer les commandes clients
        for jour, q_demande in partie.demande_client.items():
            cur3.execute(
                "INSERT INTO commande_client (jour, q_demande_boite_magique, id_partie_fk) VALUES (%s, %s, %s)",
                (jour, q_demande, id_partie_generated)
            )
        conn3.commit()
        return {"status": "success", "message": "Partie et commandes client créées avec succès"}
    except psycopg2.Error as e:

        conn.rollback()  # Annuler les modifications en cas d'erreur
        conn2.rollback() 
        conn3.rollback() 
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {e}")
    finally:

        cur.close()
        conn.close()

        cur2.close()
        conn2.close()

        cur3.close()
        conn3.close()


@app.get("/all_equipe-info/{id_partie}")
async def get_all_equipe_info(id_partie : int):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:

        
        # Sélectionner les informations de toutes les équipes et les commandes clients associées
        select_sql = """
        SELECT                        
                e.id_equipe,
                ei.jour,
                ei.q_prod_caps_magique,
                ei.q_prod_boite_magique,
                ei.q_vendu_boite_magique,
                ei.q_commande_raisin,
                ei.q_commande_pomme,
                ei.q_commande_carton,
                cc.q_demande_boite_magique
            FROM 
                equipes e
            JOIN 
                equipe_info ei ON e.id_equipe = ei.id_equipe
            LEFT JOIN 
                commande_client cc ON e.id_partie = cc.id_partie_fk AND ei.jour = cc.jour
            WHERE 
                e.id_partie = %s
            ORDER BY 
                e.id_equipe, ei.jour;
        """
        cur.execute(select_sql,(id_partie,))
        equipe_infos = cur.fetchall()
        # Formater les résultats pour renvoyer un dictionnaire plus lisible
        results = []

        for info in equipe_infos:

            result = {
                'id_equipe': info[0],
                'jour': info[1],
                'q_prod_caps_magique': info[2],
                'q_prod_boite_magique': info[3],
                'q_vendu_boite_magique': info[4],
                'q_commande_raisin': info[5],
                'q_commande_pomme': info[6],
                'q_commande_carton': info[7],
                'commande_client': info[8]
            }
            results.append(result)

        if not results:
            raise HTTPException(status_code=404, detail="Informations non trouvées pour les équipes")
        return {"equipe_infos": results}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()


@app.delete("/partie/{id_partie}")
async def delete_partie(id_partie: int):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    
    try:
        # Vérifier si la partie existe
        cur.execute("SELECT id_partie FROM parties WHERE id_partie = %s", (id_partie,))
        partie = cur.fetchone()
        print("ok")
        if not partie:
            raise HTTPException(status_code=404, detail="Partie not found")

        # Suppression de la partie
        cur.execute("DELETE FROM parties WHERE id_partie = %s", (id_partie,))
        conn.commit()
    except Exception as e:
        conn.rollback()  # En cas d'erreur, annuler les modifications
        raise HTTPException(status_code=500, detail="Internal server error") from e
    finally:
        cur.close()
        conn.close()
    
    return {"message": "Partie deleted successfully"} 


class JoinGameRequest(BaseModel):
    nom_partie: str
    groupId: str
    pseudo: str


@app.post("/join_game")
async def register_game(request_body: JoinGameRequest):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cursor = conn.cursor()

    

    try:

        # Vérification dans la table parties
        cursor.execute("SELECT conncetion_joueur FROM parties WHERE conncetion_joueur = %s", (request_body.nom_partie,))
        partie_exists = cursor.fetchone()
        
        if not partie_exists:
            return {"error": "Partie non trouvée"}
        
        id_partie, _ = request_body.nom_partie.split('_', 1)
        id_partie = int(id_partie) 
        
        # Vérification dans la table equipes
        cursor.execute("SELECT id_equipe, stats FROM equipes WHERE id_partie = %s AND pseudo_equipe = %s", (id_partie, request_body.groupId))
        equipe = cursor.fetchone()

        if not equipe:
            return {"error": "Équipe non trouvée"}
        

        if equipe[1]:  # Si stats est True
            return {"alert": "Partie déjà lancée, rôles distribués. Veuillez voir l'administrateur pour obtenir un rôle."}

        # Ajout du joueur dans la table players si le pseudo n'existe pas déjà
        cursor.execute("SELECT id_player FROM players WHERE id_equipe = %s AND id_player = %s", (equipe[0], request_body.pseudo))
        player_exists = cursor.fetchone()
        
        if player_exists:
            return {"alert": "Pseudo déjà utilisé"}

        cursor.execute("INSERT INTO players (id_equipe, id_player) VALUES (%s, %s)", (equipe[0], request_body.pseudo))
        conn.commit()

        # Vérification du nombre de joueurs dans l'équipe
        cursor.execute("SELECT COUNT(*) AS player_count FROM players WHERE id_equipe = %s", (equipe[0],))
        player_count = cursor.fetchone()[0]

        if player_count == 5:
            cursor.execute("UPDATE equipes SET stats = TRUE WHERE id_equipe = %s", (equipe[0],))
            conn.commit()

        return {"success": "Joueur ajouté avec succès", "id_equipe" :equipe[0] }
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="Internal server error") from e
    
    finally:
        cursor.close()
        conn.close()




@app.post("/login_game")
async def login_game(request_body: JoinGameRequest):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cursor = conn.cursor()

    try:
        
        # Vérification dans la table parties
        cursor.execute("SELECT conncetion_joueur FROM parties WHERE conncetion_joueur = %s", (request_body.nom_partie,))
        partie_exists = cursor.fetchone()
        
        if not partie_exists:
            return {"error": "Partie non trouvée"}
        
        id_partie, _ = request_body.nom_partie.split('_', 1)
        id_partie = int(id_partie) 
        
        # Vérification dans la table equipes
        cursor.execute("SELECT id_equipe, stats FROM equipes WHERE id_partie = %s AND pseudo_equipe = %s", (id_partie, request_body.groupId))
        equipe = cursor.fetchone()

        if not equipe:
            return {"error": "Équipe non trouvée"}


        select_sql = "SELECT id_equipe FROM players WHERE id_equipe = %s AND id_player = %s"
        cursor.execute(select_sql, (equipe[0], request_body.pseudo))
        player_exists = cursor.fetchone()
        print(player_exists)

        if not player_exists:
            raise HTTPException(status_code=404, detail="Joueur non trouvé")

        # Vérifiez si l'équipe a stats = true
        select_sql = "SELECT stats FROM equipes WHERE id_equipe = %s"
        cursor.execute(select_sql, (equipe[0],))
        stats = cursor.fetchone()

        if stats and stats[0]:
                  
            return {"status": "success", "action": "startGameAnyway" , "id_equipe" :equipe[0] }

        # Vérifiez si le joueur possède déjà un id_role dans la base
        select_sql = "SELECT id_role FROM players_roles WHERE id_player = %s AND id_equipe = %s"
        cursor.execute(select_sql, (request_body.pseudo, equipe[0]))
        role_exists = cursor.fetchone()

        if role_exists:
           
            return {"status": "success", "action": "onSelectJob", "id_equipe" :equipe[0] }

        # Sinon, renvoyez vers la page de connexion
        
        return {"status": "success", "action": "onLogin","id_equipe" :equipe[0] }

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cursor.close()
        conn.close()



@app.post("/register-admin")
async def register_admin(admin: AdminModel):
    # print(admin)
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()

    try:
        # print("oui")
        # print(f"Oui {datetime.now(timezone.utc)}")
        # Ici, vous pouvez ajouter une logique pour vérifier l'unicité du pseudo, l'email, etc.
        # ...

        # Insertion de l'administrateur dans la base de données
        insert_sql = 'INSERT INTO admins (pseudo, email, "SUP_AD", _mdp_hash, date_creation) VALUES (%s, %s, %s, %s, %s)'
        print(f"Oui{admin} {datetime.now(timezone.utc)}")
        cur.execute(insert_sql, (admin.pseudo, admin.email, False, admin.mdp,datetime.now(timezone.utc))) # Assurez-vous d'utiliser une fonction appropriée pour hasher le mot de passe
        conn.commit()
    except psycopg2.Error as e:
        # print("oui")
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()

    return {"status": "success"}

class Team_rolesModel(BaseModel): 
    id_equipe : str
    id_role : str


@app.post("/partie/getRoleplayer")
async def get_role_player(data: Team_rolesModel):
    # Utilisation d'une connexion avec psycopg2
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    try:
        # On trouve le nombre d'équipe de la partie
        select_sql = """
        SELECT id_player 
        FROM players_roles 
        WHERE id_equipe=%s
        AND id_role= %s
        """
        cur.execute(select_sql, (data.id_equipe,data.id_role))
        user=cur.fetchone()
        return user

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()

    return {"status": "success"}



@app.post("/team/getplayer")
async def get_player_team(data:EquipesModel):
    # Utilisation d'une connexion avec psycopg2
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    try:
        # On trouve le nombre d'équipe de la partie
        select_sql = """
        SELECT id_player 
        FROM players
        WHERE id_equipe=%s
        """
        cur.execute(select_sql, (data.id_equipe,))
        users = [user[0] for user in cur.fetchall()]
        return users

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Erreur de base de données: {str(e)}")
    finally:
        cur.close()
        conn.close()

    return {"status": "success"}


@app.get("/get_stock_var/{id_equipe}")
async def get_stock_var(id_equipe: str):
    conn = psycopg2.connect(
        host=HOST,
        database=dm.db_name,
        user=USER,
        password=PASSWORD
    )
    cur = conn.cursor()
    print('ok')
    try:
        cur.execute("""
            SELECT * FROM equipe_info
            WHERE id_equipe = %s
            ORDER BY jour 
        """, (id_equipe,))

        rows = cur.fetchall()
        jour =  len(rows) + 1
        commande_initiale = [('equipe_general', -2, 0, 0, 0, 1000, 1000, 1000),
                             ('equipe_general', -1, 0, 0, 0, 1000, 1000, 1000),
                             ('equipe_general', 0, 0, 0, 0, 1000, 1000, 1000)]
        
        rows = commande_initiale + rows

        stock_raisin = 0
        stock_rose = 0
        stock_carton = 0
        stock_capsule = 0
        stock_boite = 0
        stock_vendu = 0

        q_reçu_raisin =rows[-3][5]
        q_reçu_rose = rows[-3][6]
        q_reçu_carton = rows[-3][7]
        

        for ligne in rows[:-2] :
            stock_raisin+= ligne[5]
            stock_rose += ligne[6]
            stock_carton += ligne[7]
        
        if jour >= 2 : 
            for ligne in rows[3:] :
                stock_capsule+= ligne[2]
                stock_boite += ligne[3]
                stock_vendu += ligne[4]

        Quant_init =100
        stock_raisin =  stock_raisin - stock_capsule + Quant_init
        stock_rose = stock_rose - stock_capsule + Quant_init
        stock_carton = stock_carton - 2* stock_boite + Quant_init

        Quant_init =10
        stock_capsule = stock_capsule - 10*stock_boite + Quant_init
        stock_boite = stock_boite - stock_vendu + Quant_init
      
        return {"jour": jour, 
                "stock_raisin" : stock_raisin,
                "stock_rose" :  stock_rose ,
                "stock_carton" : stock_carton,
                "stock_capsule" : stock_capsule,
                "stock_boite" : stock_boite,
                "q_reçu_raisin": q_reçu_raisin ,
                "q_reçu_rose":    q_reçu_rose ,
                "q_reçu_carton" :  q_reçu_carton, 
                }
        
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    finally:
        if conn:
            conn.close()


class EquipeInfoModel(BaseModel):
    id_equipe: str
    jour: int
    q_prod_caps_magique: int
    q_prod_boite_magique: int
    q_vendu_boite_magique: int
    q_commande_raisin: int
    q_commande_pomme: int
    q_commande_carton: int

@app.post("/add_equipe_info")
async def add_equipe_info(equipe_info: EquipeInfoModel):
    try:
        conn = psycopg2.connect(
            host=HOST,
            database=dm.db_name,
            user=USER,
            password=PASSWORD
        )
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO equipe_info (id_equipe, jour, q_prod_caps_magique, q_prod_boite_magique, q_vendu_boite_magique, q_commande_raisin, q_commande_pomme, q_commande_carton)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            equipe_info.id_equipe,
            equipe_info.jour,
            equipe_info.q_prod_caps_magique,
            equipe_info.q_prod_boite_magique,
            equipe_info.q_vendu_boite_magique,
            equipe_info.q_commande_raisin,
            equipe_info.q_commande_pomme,
            equipe_info.q_commande_carton,
        ))
        conn.commit()

        return {"message": "Ligne ajoutée avec succès"}

    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    finally:
        if conn:
            conn.close()
# Getting Started with Create React App

## Démarrer le front
### installer les dépendances :
```
yarn install
```

### démarrer le front (si présence de yarn.lock):
```
yarn start
```

### Pour se connecter à la base donnée associé au site web:

```
psql -U user -d jouflux
```


## Etapes à faire avant de lancer le back 

### création d'un utilisateur 
```
sudo su - postgres -c "psql" <<< "create user joufluxadmin with password 'joufluxadminpass'"
````

### création d'une database 
```
sudo su - postgres -c "psql" <<< "create database jouflux owner joufluxadmin"
```

### Donner les droits super-utilisateur 

Connectez-vous à PostgreSQL 
```
sudo su - postgres -c "psql"
```
Une fois connecté, mettre à jour les privilèges de l'utilisateur  
```
postgres=# ALTER USER joufluxadmin WITH SUPERUSER;
```
Lister les utilsateurs et leurs rôles et vérifiez les changements
``` 
\du
```
## Lancer le back avec poetry

### télécharger les dépendances
```
poetry install
```
### lancer l'environement virtuel de poetry (si présence de poetry.lock)
```
poetry shell
```

### lancer le code 
```
uvicorn Jouflux_api:app --reload
```
## Lancer le back
### démarage environnement virtuel
```
source venv/bin/activate
```

## télecharger uvicorn : 

```
pip install uvicorn
```
## télecharger fastapi : 

```
pip install fastapi
```

## lancer l'api
```
uvicorn Jouflux_api:app --reload
```
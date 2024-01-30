import sqlalchemy
from sqlalchemy import (
    Column, Integer, String, ForeignKey, create_engine, text, Boolean , PrimaryKeyConstraint , ForeignKeyConstraint,
    DateTime, func
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy_utils import create_database, database_exists, drop_database
from sqlalchemy.orm import sessionmaker

#import bcrypt
# TODO #
USER = 
PASSWORD = 
HOST = 
PORT = "5432"
#####
Base = declarative_base()


class Admins(Base):
    __tablename__ = 'admins'

    pseudo = Column(String, primary_key=True)
    email = Column(String)
    SUP_AD = Column(Boolean)
    _mdp_hash = Column(String)
    date_creation = Column(DateTime(timezone=True), default = func.now())

    #def set_password(self, mdp):
    #    mdp_hash = bcrypt.hashpw(mdp.encode('utf-8'), bcrypt.gensalt())
    #    self._mdp_hash = mdp_hash.decode('utf-8')
    #
    #def check_password(self, mdp):
    #    return bcrypt.checkpw(mdp.encode('utf-8'), self._mdp_hash.encode('utf-8'))

class Parties(Base):
    __tablename__ = 'parties'

    id_partie = Column(Integer,primary_key=True)
    id_admin = Column(String, ForeignKey('admins.pseudo', ondelete="CASCADE"))
    nom = Column(String)
    conncetion_joueur = Column(String)
    date_creation = Column(DateTime(timezone=True), default=func.now())


class Equipes(Base):
    __tablename__ = 'equipes'

    id_partie = Column(Integer, ForeignKey('parties.id_partie', ondelete="CASCADE"))
    pseudo_equipe=Column(String) 
    id_equipe = Column(String, unique=True)
    stats = Column(Boolean)

    __table_args__ = (
        PrimaryKeyConstraint('id_partie', 'id_equipe'),
    )

class CommandeClient(Base):
    __tablename__ = 'commande_client'  # Correction ici

    jour = Column(Integer)
    q_demande_boite_magique = Column(Integer)
    id_partie_fk = Column(Integer, ForeignKey('parties.id_partie', ondelete="CASCADE"))

    __table_args__ = (
        PrimaryKeyConstraint('jour', 'id_partie_fk'),
    )


class Players(Base):
    __tablename__ = 'players'
    
    id_equipe = Column(String, ForeignKey('equipes.id_equipe', ondelete="CASCADE"))
    id_player = Column(String)
    
    __table_args__ = (
        PrimaryKeyConstraint('id_player', 'id_equipe'),
    )

class Equipe_info(Base):
    __tablename__ = 'equipe_info'
    

    id_equipe = Column(String)
    jour = Column(Integer)
    q_prod_caps_magique = Column(Integer)
    q_prod_boite_magique = Column(Integer)
    q_vendu_boite_magique = Column(Integer)
    q_commande_raisin = Column(Integer)
    q_commande_pomme = Column(Integer)
    q_commande_carton = Column(Integer)

    __table_args__ = (
        PrimaryKeyConstraint('id_equipe', 'jour'),
        ForeignKeyConstraint(
            ['id_equipe'], 
            ['equipes.id_equipe'],
            ondelete="CASCADE"
            ),
    )
# stock jours précédent 
# commandes des jours précédent 


class Player_states(Base):
    __tablename__ = 'players_states'
    
    id_player = Column(String)
    id_equipe = Column(String)
    action = Column(Boolean)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    __table_args__ = (
        PrimaryKeyConstraint('id_player', 'id_equipe'),
        ForeignKeyConstraint(
            ['id_player', 'id_equipe'], 
            ['players.id_player', 'players.id_equipe'],
            ondelete="CASCADE"
            ),
    )


class Players_roles(Base):
    __tablename__ = 'players_roles'
    
    id_player = Column(String)
    id_equipe = Column(String)
    id_role = Column(Integer, ForeignKey('roles.id_role'))
    
    __table_args__ = (
        PrimaryKeyConstraint('id_player', 'id_equipe','id_role'),
        ForeignKeyConstraint(
            ['id_player', 'id_equipe'], 
            ['players.id_player', 'players.id_equipe'],
            ondelete="CASCADE"
            ),
    )


class Role(Base):
    __tablename__ = 'roles'
    
    id_role = Column(Integer, primary_key=True)
    content = Column(String)



class DatabaseManagement:
    def __init__(self, db_name: str, recreate: bool):
        self.engine = create_engine(
            f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{db_name}"
        )

        self.db_name = db_name
        if recreate:
            if database_exists(self.engine.url):
                drop_database(self.engine.url)

        if not database_exists(self.engine.url):
            self.create_db()
        if not sqlalchemy.inspect(self.engine).has_table("commande_client"):
            self.create_tables()
            self.insert_initial_values()
    


    def insert_initial_values(self):
        Session = sessionmaker(bind=self.engine)
        session = Session()

        Session2 = sessionmaker(bind=self.engine)
        session2 = Session2()

        Session3 = sessionmaker(bind=self.engine)
        session3 = Session3()

        try:
            admin1 =  Admins(
                        pseudo = "admin",
                        email = "test@",
                        SUP_AD = True,
                        _mdp_hash = "mdp",
                            )
            session2.add(admin1)
           
            session2.commit()



            role_default = Role(id_role=0, content="Non défini")
            role_default1 = Role(id_role=1, content="job 1")
            role_default2 = Role(id_role=2, content="job 2")
            role_default3 = Role(id_role=3, content="job 3")
            role_default4 = Role(id_role=4, content="job 4")
            role_default5 = Role(id_role=5, content="job 5")
            session3.add(role_default)
            session3.add(role_default1)
            session3.add(role_default2)
            session3.add(role_default3)
            session3.add(role_default4)
            session3.add(role_default5)

      

            session3.commit()
     
        except Exception as e:
            session.rollback()
        finally:
            session.close()

    def create_db(self):
        create_database(self.engine.url)
        
    def create_tables(self):
        Base.metadata.create_all(self.engine)

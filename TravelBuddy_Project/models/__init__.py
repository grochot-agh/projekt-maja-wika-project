from flask_sqlalchemy import SQLAlchemy

# obiekt bazy danych
db = SQLAlchemy()

# importuje user, task; modele sa zarejestrowane w sqlal
from .user import User

# inicjuje baze danych
def init_db():
    db.create_all() #utworzy tabele, jesli jeszcze nie istnieje
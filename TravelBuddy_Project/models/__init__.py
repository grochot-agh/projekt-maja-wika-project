from flask_sqlalchemy import SQLAlchemy

# obiekt bazy danych
db = SQLAlchemy()

from .user import User

def init_db():
    db.create_all() 

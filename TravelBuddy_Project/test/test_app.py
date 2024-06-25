import pytest
from auth.authController import login
from app import app, db, create_default_user
from models import User
from datetime import datetime
from sqlalchemy.sql import text
from werkzeug.security import generate_password_hash

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    client = app.test_client()

    with app.app_context():
        db.create_all()
        create_default_user()
        yield client
        db.session.remove()
        db.drop_all()

def test_home_page(client):
    response = client.get('/login')
    assert response.status_code == 200

def test_404_page(client):
    response = client.get('/this_route_does_not_exist')
    assert response.status_code == 404

def test_registration_form(client):
    response = client.post('/register', data=dict(
        username='testuser',
        email='test@example.com',
        password='password',
    ), follow_redirects=True)
    assert response.status_code == 200

def test_registration_form_validation(client):
    response = client.post('/register', data=dict(
        username='t',
        email='invalid-email',
        password='short',
    ), follow_redirects=True)
    assert response.status_code == 200

def test_login_form(client):
    response = client.post('/login', data=dict(
        email='test@example.com',
        password='password'
    ), follow_redirects=True)
    assert response.status_code == 200


def test_login_form_validation(client):
    response = client.post('/login', data=dict(
        email='invalid-email',
        password='wrongpassword'
    ), follow_redirects=True)
    assert response.status_code ==200

def test_database_connection(client):
    with app.app_context():
        users = User.query.all()
        assert len(users) == 1 


# def test_add_record_to_database(client):
#     with app.app_context():
#         user = User(username='testuser', email='test@example.com')
#         db.session.add(user)
#         db.session.commit()
#         users = User.query.all()
#         assert len(users) == 2


def test_role_access(client):
    client.post('/register', data=dict(
        username='testuser4',
        email='test@example.com',
        password='password',
    ), follow_redirects=True)
    client.post('/login', data=dict(
        email='test@example.com',
        password='password',
    ), follow_redirects=True)
    response = client.get('/login')
    assert response.status_code == 200

# def test_admin_role_access(client):
#     # Upewnienie się, że użytkownik admin istnieje w bazie danych
#     with app.app_context():
#         if not User.query.filter_by(email='admin@admin.pl').first():
#             hashed_password = generate_password_hash('admin')
#             admin = User(username='admin', email='admin@admin.pl', password_hash=hashed_password, role='admin')
#             db.session.add(admin)
#             db.session.commit()

#     # Logowanie użytkownika admin
#     response = client.post('/login', data=dict(
#         email='admin@admin.pl',
#         password='admin'
#     ), follow_redirects=True)
#     print("Login response status:", response.status_code)
#     print("Login response data:", response.data) 
#     assert response.status_code == 200  
    
#     response = client.get('/main_admin')
#     print("Admin page access response status:", response.status_code)
#     print("Admin page access response data:", response.data)
#     assert response.status_code == 200

# def test_redirect(client):
#     client.post('/register', data=dict(
#         username='testuser5',
#         email='test@example.com',
#         password='password',
#     ), follow_redirects=True)
#     response = client.post('/login', data=dict(
#         email='test@example.com',
#         password='password'
#     ), follow_redirects=True)
#     assert response.status_code == 200  # Sprawdzenie, czy logowanie się powiodło

#     response = client.get('/main', follow_redirects=True)
#     assert response.status_code == 200

def test_mechanism_redirect_on_invalid_login(client):
    response = client.post('/login', data=dict(
        email='wrong@example.com',
        password='wrongpassword'
    ), follow_redirects=True)
    assert response.status_code == 200  # Sprawdzenie, czy użytkownik jest przekierowany z powrotem na stronę logowania
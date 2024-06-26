from flask import Flask, render_template, redirect, url_for, flash, make_response, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager,  login_user, login_required, logout_user, current_user
from auth.forms import LoginForm, RegisterForm
from werkzeug.security import check_password_hash, generate_password_hash
from flask_bootstrap import Bootstrap
from config import start, loginManeger
from auth.authController import auth
from models import db, User
import os
import requests

app = Flask(__name__)
start(app=app, db = db)
login_manager = loginManeger(app)

app.register_blueprint(auth)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def create_default_user():
    if not User.query.filter_by(username='admin').first():
        hashed_password = generate_password_hash('admin', method='pbkdf2')
        admin = User(username='admin',email = 'admin@admin.pl' ,role='admin', password_hash = hashed_password)
        db.session.add(admin)
        db.session.commit()

@app.route('/')
def log():
   return redirect(url_for('auth.login'))

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Page Not Found'}),404)

@app.route('/this_route_does_not_exist')
def get_nonexistent_route():
    return not_found(404)

@app.errorhandler(403)
def forbidden(error):
    return make_response(jsonify({'error': 'Forbidden Access'}),403)

@app.route('/forbidden')
def get_forbidden():
    return forbidden(403)

# ! Przy projekcie korzystałyśmy z API serpapi, które ma ograniczoną ilość użyć (aktualnie zostało około 10 wyszukiwań lotów), gdyby zostały wykorzystane, należy zmienić API key na poniższy:
# 172d72e07eaa66177db4cd4db6389136c64c2f42cf426433b0d4b2818e5903cb

def search_flights(departure_id, arrival_id, outbound_date, return_date='2025-02-01', currency='USD', hl='en'):
    url = "https://serpapi.com/search"
    params = {
        "engine": "google_flights",
        "departure_id": departure_id,
        "arrival_id": arrival_id,
        "outbound_date": outbound_date,
        "return_date": return_date,
        "currency": currency,
        "hl": hl,
        "api_key": "d62d556690b77b62aaf278c9d702ce37130a0373415afd5fe997a1b1c9fa7351"
    }
    response = requests.get(url, params=params)
    results = response.json()

    # Dodanie unikalnego ID do każdego lotu
    for i, flight in enumerate(results.get("best_flights", [])):
        flight['id'] = i
    # Debugowanie
    # print("Response status code:", response.status_code)
    # print("Response JSON:", results)

    return results.get("best_flights", [])

@app.route('/search', methods=['POST'])
def search():
    departure_id = request.form['departure_id']
    arrival_id = request.form['arrival_id']
    outbound_date = request.form['outbound_date']
    #return_date = request.form['return_date']

    results = search_flights(departure_id, arrival_id, outbound_date)
    
    if not results:
        return jsonify({'error': "No flights found or an error occurred"})

    return jsonify({'flights': results})

with app.app_context():
    db.create_all()
    create_default_user()


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

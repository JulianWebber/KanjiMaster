from flask import render_template, request, jsonify, session, redirect, url_for
from app import app, db
from models import User, Kanji, UserProgress
from utils import get_next_kanji, update_user_progress
from werkzeug.security import generate_password_hash, check_password_hash

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/flashcards')
def flashcards():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('flashcards.html')

@app.route('/quiz')
def quiz():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('quiz.html')

@app.route('/practice')
def practice():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('practice.html')

@app.route('/get_next_kanji')
def get_next_kanji_route():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401
    kanji = get_next_kanji(session['user_id'])
    return jsonify(kanji)

@app.route('/update_progress', methods=['POST'])
def update_progress():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401
    data = request.json
    update_user_progress(session['user_id'], data['kanji_id'], data['familiarity'])
    return jsonify({'success': True})

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id
    return jsonify({'success': True})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password_hash, data['password']):
        session['user_id'] = user.id
        return jsonify({'success': True})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

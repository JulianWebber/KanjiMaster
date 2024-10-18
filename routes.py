from flask import render_template, request, jsonify, session, redirect, url_for
from app import app, db
from models import User, Kanji, UserProgress
from utils import get_next_kanji, update_user_progress
from datetime import datetime

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
    try:
        kanji = get_next_kanji(session['user_id'])
        if kanji:
            return jsonify(kanji)
        else:
            return jsonify({'error': 'No kanji available'}), 404
    except Exception as e:
        app.logger.error(f"Error in get_next_kanji: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/update_progress', methods=['POST'])
def update_progress():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401
    data = request.json
    try:
        update_user_progress(session['user_id'], data['kanji_id'], data['familiarity'])
        return jsonify({'success': True})
    except Exception as e:
        app.logger.error(f"Error in update_progress: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id
    return jsonify({'success': True})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        session['user_id'] = user.id
        user.last_login = datetime.utcnow()
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

@app.route('/user_profile')
def user_profile():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    user = User.query.get(session['user_id'])
    return render_template('user_profile.html', user=user)

@app.route('/update_preferences', methods=['POST'])
def update_preferences():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401
    data = request.json
    user = User.query.get(session['user_id'])
    user.preferred_learning_method = data.get('preferred_learning_method', user.preferred_learning_method)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/kanji_lookup', methods=['GET', 'POST'])
def kanji_lookup():
    jlpt_levels = [1, 2, 3, 4, 5]
    radicals = ['水', '火', '木', '金', '土']  # Add more radicals as needed
    
    if request.method == 'POST':
        search_type = request.form.get('search_type')
        search_value = request.form.get('search_value')
        
        if search_type == 'jlpt':
            kanji_list = Kanji.query.filter_by(jlpt_level=search_value).all()
        elif search_type == 'radical':
            kanji_list = Kanji.query.filter(Kanji.radicals.contains(search_value)).all()
        else:
            kanji_list = []
        
        return render_template('kanji_lookup.html', kanji_list=kanji_list, jlpt_levels=jlpt_levels, radicals=radicals)
    
    return render_template('kanji_lookup.html', kanji_list=[], jlpt_levels=jlpt_levels, radicals=radicals)

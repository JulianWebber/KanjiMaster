from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    total_kanji_learned = db.Column(db.Integer, default=0)
    preferred_learning_method = db.Column(db.String(20), default='flashcards')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Kanji(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    character = db.Column(db.String(1), unique=True, nullable=False)
    meaning = db.Column(db.String(100), nullable=False)
    onyomi = db.Column(db.String(100))
    kunyomi = db.Column(db.String(100))
    example_sentence = db.Column(db.String(200))

class UserProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    kanji_id = db.Column(db.Integer, db.ForeignKey('kanji.id'), nullable=False)
    familiarity = db.Column(db.Integer, default=0)
    next_review = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('progress', lazy=True))
    kanji = db.relationship('Kanji', backref=db.backref('progress', lazy=True))

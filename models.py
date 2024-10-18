from app import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

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

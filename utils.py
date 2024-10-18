from app import db
from models import Kanji, UserProgress
from datetime import datetime, timedelta

def get_next_kanji(user_id):
    # Get the next kanji due for review
    next_kanji = UserProgress.query.filter_by(user_id=user_id).order_by(UserProgress.next_review).first()
    
    if next_kanji:
        kanji = Kanji.query.get(next_kanji.kanji_id)
        return {
            'id': kanji.id,
            'character': kanji.character,
            'meaning': kanji.meaning,
            'onyomi': kanji.onyomi,
            'kunyomi': kanji.kunyomi,
            'example_sentence': kanji.example_sentence
        }
    else:
        # If no kanji is due, get a random new kanji
        new_kanji = Kanji.query.filter(~Kanji.progress.any(UserProgress.user_id == user_id)).order_by(db.func.random()).first()
        if new_kanji:
            return {
                'id': new_kanji.id,
                'character': new_kanji.character,
                'meaning': new_kanji.meaning,
                'onyomi': new_kanji.onyomi,
                'kunyomi': new_kanji.kunyomi,
                'example_sentence': new_kanji.example_sentence
            }
    return None

def update_user_progress(user_id, kanji_id, familiarity):
    progress = UserProgress.query.filter_by(user_id=user_id, kanji_id=kanji_id).first()
    
    if not progress:
        progress = UserProgress(user_id=user_id, kanji_id=kanji_id)
        db.session.add(progress)
    
    progress.familiarity = familiarity
    
    # Update next review time based on familiarity (simple spaced repetition)
    if familiarity == 0:
        progress.next_review = datetime.utcnow() + timedelta(hours=1)
    elif familiarity == 1:
        progress.next_review = datetime.utcnow() + timedelta(days=1)
    elif familiarity == 2:
        progress.next_review = datetime.utcnow() + timedelta(days=3)
    elif familiarity == 3:
        progress.next_review = datetime.utcnow() + timedelta(days=7)
    else:
        progress.next_review = datetime.utcnow() + timedelta(days=14)
    
    db.session.commit()

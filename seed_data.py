from app import app, db
from models import Kanji

def seed_kanji_data():
    kanji_list = [
        {
            "character": "水",
            "meaning": "water",
            "onyomi": "スイ",
            "kunyomi": "みず",
            "example_sentence": "水を飲む (みずをのむ) - To drink water",
            "jlpt_level": 5,
            "radicals": "氵"
        },
        {
            "character": "火",
            "meaning": "fire",
            "onyomi": "カ",
            "kunyomi": "ひ",
            "example_sentence": "火を消す (ひをけす) - To extinguish a fire",
            "jlpt_level": 5,
            "radicals": "火"
        },
        {
            "character": "木",
            "meaning": "tree",
            "onyomi": "モク、ボク",
            "kunyomi": "き",
            "example_sentence": "木を植える (きをうえる) - To plant a tree",
            "jlpt_level": 5,
            "radicals": "木"
        },
        {
            "character": "金",
            "meaning": "gold, money",
            "onyomi": "キン、コン",
            "kunyomi": "かね",
            "example_sentence": "金を稼ぐ (かねをかせぐ) - To earn money",
            "jlpt_level": 5,
            "radicals": "金"
        },
        {
            "character": "土",
            "meaning": "earth, soil",
            "onyomi": "ド、ト",
            "kunyomi": "つち",
            "example_sentence": "土を耕す (つちをたがやす) - To till the soil",
            "jlpt_level": 5,
            "radicals": "土"
        }
    ]

    for kanji_data in kanji_list:
        kanji = Kanji(**kanji_data)
        db.session.add(kanji)

    db.session.commit()
    print("Kanji data seeded successfully!")

if __name__ == "__main__":
    with app.app_context():
        seed_kanji_data()

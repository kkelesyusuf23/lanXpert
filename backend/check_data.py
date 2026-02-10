import sys
import os
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app import models

def main():
    db = SessionLocal()
    try:
        langs = db.query(models.Language).all()
        print(f"Total Languages: {len(langs)}")
        for l in langs:
            print(f"Language: {l.name} ({l.code}) - ID: {l.id}")
            
        # Also check articles to see if any exist
        articles = db.query(models.Article).all()
        print(f"Total Articles: {len(articles)}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()


import sys
import os

# Add parent directory to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import models
from app.database import Base
from app.config import settings
from datetime import datetime

# Setup DB
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def fix_daily():
    print("Checking for answers...")
    # Get any answer
    answer = db.query(models.Answer).order_by(models.Answer.created_at.desc()).first()
    
    if not answer:
        print("No answers found! Creating a dummy one...")
        # Check if users exist
        user = db.query(models.User).first()
        if not user:
            print("No users found. Cannot create answer.")
            return
            
        # Check/Create Question
        question = db.query(models.Question).first()
        if not question:
            print("Creating dummy question...")
            question = models.Question(
                user_id=user.id,
                question_text="How do you say 'Hello' in Turkish?",
                description="Just wondering.",
                source_language_id="en", # Assuming these exist or foreign keys might fail if languages table empty
                target_language_id="tr"
            )
            db.add(question)
            db.commit()
            db.refresh(question)
            
        print("Creating dummy answer...")
        answer = models.Answer(
            user_id=user.id,
            question_id=question.id,
            answer_text="You say 'Merhaba'.",
            helpful_count=10
        )
        db.add(answer)
        db.commit()
        print("Created new featured answer.")
    else:
        print(f"Found answer: {answer.id}")
        if (answer.helpful_count or 0) < 5:
            print("Boosting helpful count to 5...")
            answer.helpful_count = 5
            # Update updated_at to bring it to 'now' window if needed, or created_at
            answer.created_at = datetime.utcnow()
            db.commit()
            print("Updated answer to be featured.")
        else:
            print(f"Answer already has {answer.helpful_count} likes.")

if __name__ == "__main__":
    try:
        fix_daily()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

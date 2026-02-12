from app.database import SessionLocal
from app import models

def check_user_yuke():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.username == 'yuke').first()
        if not user:
            print("User 'yuke' not found.")
            return

        print(f"User: {user.username}")
        print(f"ID: {user.id}")
        print(f"Plan ID: {user.plan_id}")
        print(f"Native Lang ID: {user.native_language_id}")
        print(f"Target Lang ID: {user.target_language_id}")
        
        if not user.target_language_id:
            print("(!) Target Language is MISSING")
        else:
            lang = db.query(models.Language).get(user.target_language_id)
            print(f"Target Language: {lang.name if lang else 'Invalid ID'}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_user_yuke()

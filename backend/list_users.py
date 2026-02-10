import sys
import os

# PYTHONPATH'e kök dizini ekle, böylece `import app` çalışır.
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app import models

def main():
    db = SessionLocal()
    try:
        users = db.query(models.User).all()
        print(f"Total Users: {len(users)}")
        for user in users:
            print(f"User Found: ID={user.id}, Username='{user.username}', Email='{user.email}', Active={user.is_active}")
            print(f"  Password Hash: {user.password_hash[:20]}..." if user.password_hash else "  Password Hash: NONE")
    except Exception as e:
        print(f"Error checking users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()

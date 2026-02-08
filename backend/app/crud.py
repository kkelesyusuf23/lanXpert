from sqlalchemy.orm import Session
from . import models, schemas, auth

def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    # Allow login by username OR email
    user = db.query(models.User).filter((models.User.username == username) | (models.User.email == username)).first()
    return user

def create_user(db: Session, user: schemas.UserCreate):
    password_hash = auth.get_password_hash(user.password)
    # Assign default plan (Plan logic to be added, assuming Free plan exists or default logic)
    # For now just create user without specific plan linkage or handle in future
    db_user = models.User(
        email=user.email, 
        username=user.username, 
        password_hash=password_hash
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

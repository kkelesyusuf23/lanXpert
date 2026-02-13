from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from .. import crud, schemas, dependencies
from ..database import get_db
from ..patterns.mediator import mediator
from ..features.users.create_user import CreateUserCommand, CreateUserHandler

# Register Handler
mediator.register(CreateUserCommand, CreateUserHandler)

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    command = CreateUserCommand(user, db)
    try:
        return mediator.send(command)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me", response_model=schemas.UserOut)
async def read_users_me(current_user: schemas.UserOut = Depends(dependencies.get_current_active_user)):
    return current_user

@router.put("/me", response_model=schemas.UserOut)
async def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: schemas.UserOut = Depends(dependencies.get_current_active_user),
    db: Session = Depends(get_db)
):
    # This logic should ideally be in a Command Handler, but for speed I'll put it here or use a simple CRUD update
    # actually, let's use a simple crud function or direct DB update since I don't want to create a whole new handler file right now unless necessary.
    # checking crud.py... I assume I can just update the model.
    # wait, UserOut is a Pydantic model, but current_user from dependency is usually the ORM model if properly typed?
    # verify dependencies.get_current_active_user
    
    # Re-fetch user from DB to ensure it's attached to session (dependency might return detached or Pydantic)
    # Actually dependencies usually returns the database model. 
    # Let's check crud.py content to be safe.
    
    # For now, I'll assume current_user is the ORM model or I can fetch it.
    # Let's write a safe update.
    
    db_user = crud.get_user(db, user_id=current_user.id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/verify-email/send")
async def send_verification_email(
    current_user: schemas.UserOut = Depends(dependencies.get_current_active_user),
    db: Session = Depends(get_db)
):
    import uuid
    # 1. Generate Token
    token = str(uuid.uuid4())
    
    # 2. Save to User
    db_user = crud.get_user(db, user_id=current_user.id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_user.verification_token = token
    db.add(db_user)
    db.commit()
    
    # 3. Simulate Sending Email (In production, use SMTP)
    # Returning the token here for development purposes so the frontend can use it directly
    import os
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    verification_link = f"{frontend_url}/verify-email/confirm?token={token}"
    print(f"----- VERIFICATION EMAIL SENT TO {current_user.email} -----")
    print(f"Link: {verification_link}")
    print("-----------------------------------------------------------")
    
    return {"message": "Verification email sent", "dev_token": token, "link": verification_link}

@router.post("/verify-email/verify")
async def verify_email(
    token: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    from .. import models # Late import to avoid circular dep if any
    
    user = db.query(models.User).filter(models.User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
        
    user.email_verified = True
    user.verification_token = None
    db.add(user)
    db.commit()
    
    return {"message": "Email verified successfully"}

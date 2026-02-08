from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import auth, crud, schemas, dependencies

router = APIRouter()

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(dependencies.get_db)):
    user = crud.get_user_by_username(db, username=form_data.username)
    print(f"DEBUG: Login attempt for '{form_data.username}'")
    if user:
        print(f"DEBUG: User found. Hash: {user.password_hash}")
        verify_result = auth.verify_password(form_data.password, user.password_hash)
        print(f"DEBUG: Password verification result: {verify_result}")
    else:
        print("DEBUG: User not found")

    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = auth.create_refresh_token(
        data={"sub": user.username}
    )
    
    # Store refresh token in DB (Simplified logic for now, ideally strictly tracked)
    # db_refresh = models.RefreshToken(token=refresh_token, user_id=user.id, expires_at=...)
    # db.add(db_refresh); db.commit()
    
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

@router.post("/refresh", response_model=schemas.Token)
def refresh_token(refresh_token: str, db: Session = Depends(dependencies.get_db)):
    try:
        payload = jwt.decode(refresh_token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None or payload.get("type") != "refresh":
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    
    # In a real scenario, check DB if revoked
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": username}, expires_delta=access_token_expires
    )
    # Rotate refresh token? Optional but recommended
    new_refresh_token = auth.create_refresh_token(data={"sub": username})
    
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": new_refresh_token}

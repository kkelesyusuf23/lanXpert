from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from . import crud, models, schemas, auth, database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_admin_user(current_user: models.User = Depends(get_current_active_user)):
    # Check roles
    # Assuming user.roles is a list of UserRole association objects or Role objects
    # Based on models.py: user.roles = relationship("UserRole", back_populates="user")
    # UserRole has .role relationship to Role model which has .name
    
    is_admin = False
    for user_role in current_user.roles:
        if user_role.role.name in ["admin", "moderator"]:
            is_admin = True
            break
            
    if not is_admin:
        # Fallback: check if hardcoded admin (e.g. for development)
        if current_user.username == "admin" or current_user.email == "admin@lanxpert.com":
             pass # Allow default admin
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="You do not have administrative privileges"
            )
    return current_user


async def get_current_super_admin(current_user: models.User = Depends(get_current_active_user)):
    is_super_admin = False
    for user_role in current_user.roles:
        if user_role.role.name == "admin":
            is_super_admin = True
            break
            
    if not is_super_admin:
        # Fallback: check if hardcoded admin
        if current_user.username == "admin" or current_user.email == "admin@lanxpert.com":
             pass 
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="You need full administrative privileges (Admin role) for this action"
            )
    return current_user

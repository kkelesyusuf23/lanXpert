from backend.app.patterns.mediator import IRequest, IRequestHandler
from backend.app.patterns.validation import AbstractValidator, ValidationException, ValidationFailure
from backend.app.models import User
from backend.app.schemas import UserCreate, UserOut
from backend.app.database import get_db
from backend.app.auth import get_password_hash
from sqlalchemy.orm import Session
from fastapi import HTTPException

# Command
class CreateUserCommand(IRequest[UserOut]):
    def __init__(self, user_create: UserCreate, db: Session):
        self.user_create = user_create
        self.db = db

# Validator
class CreateUserValidator(AbstractValidator[UserCreate]):
    def __init__(self):
        super().__init__()
        self.rule_for(lambda x: x.username, "Username").not_empty().minimum_length(3).with_message("Username must be at least 3 characters")
        self.rule_for(lambda x: x.email, "Email").not_empty().email_address().with_message("Invalid email format")
        self.rule_for(lambda x: x.password, "Password").not_empty().minimum_length(6).with_message("Password must be at least 6 characters")

# Handler
class CreateUserHandler(IRequestHandler[CreateUserCommand, UserOut]):
    def handle(self, command: CreateUserCommand) -> UserOut:
        # Validate first
        validator = CreateUserValidator()
        failures = validator.validate(command.user_create)
        
        # Additional Database Checks (Business Rules)
        db_user = command.db.query(User).filter(User.email == command.user_create.email).first()
        if db_user:
            failures.append(ValidationFailure("Email", "Email already registered"))
            
        db_username = command.db.query(User).filter(User.username == command.user_create.username).first()
        if db_username:
            failures.append(ValidationFailure("Username", "Username already taken"))
            
        if failures:
            # Raise exception with detailed validation errors
            raise HTTPException(status_code=400, detail=[f.error_message for f in failures])

        # Proceed to Create
        hashed_password = get_password_hash(command.user_create.password)
        db_user = User(
            email=command.user_create.email,
            username=command.user_create.username,
            password_hash=hashed_password,
            is_active=True
        )
        command.db.add(db_user)
        command.db.commit()
        command.db.refresh(db_user)
        
        return UserOut.from_orm(db_user)


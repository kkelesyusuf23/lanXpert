from pydantic import BaseModel, EmailStr, Field
import uuid
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    native_language_id: Optional[str] = None
    target_language_id: Optional[str] = None
    interface_language_id: Optional[str] = None

class UserOut(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    plan_id: Optional[str]
    native_language_id: Optional[str]
    target_language_id: Optional[str]
    email_verified: bool
    roles: List["UserRoleOut"] = []

    class Config:
        from_attributes = True

class RoleBase(BaseModel):
    name: str

class RoleOut(RoleBase):
    id: str
    class Config:
        from_attributes = True

class UserRoleOut(BaseModel):
    role: RoleOut
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Feature Schemas ---

class WordBase(BaseModel):
    word: str
    meaning: str
    part_of_speech: Optional[str] = None
    level: str
    language_id: str # Native Language
    target_language_id: Optional[str] = None # Target Language

class WordCreate(WordBase):
    pass

class WordOut(WordBase):
    id: str
    is_active: bool
    class Config:
        from_attributes = True

class AnswerBase(BaseModel):
    answer_text: str
    question_id: str

class AnswerCreate(AnswerBase):
    pass

class AnswerOut(AnswerBase):
    id: str
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[UserOut] = None
    
    helpful_count: Optional[int] = 0
    is_helpful: bool = False # For current user
    context_tags: Optional[str] = None # "comma,separated"
    
    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    question_text: str
    description: Optional[str] = None
    source_language_id: Optional[str] = None # Native
    target_language_id: Optional[str] = None # Target

class QuestionCreate(QuestionBase):
    pass

class QuestionOut(QuestionBase):
    id: str
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[UserOut] = None
    answers: List[AnswerOut] = [] # Nested answers
    
    is_saved: bool = False # Current user saved?
    
    class Config:
        from_attributes = True

class ArticleBase(BaseModel):
    title: str
    content: str
    language_id: str

class ArticleCreate(ArticleBase):
    pass

class ArticleOut(ArticleBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    user: Optional[UserOut] = None
    like_count: int = 0
    is_liked: bool = False
    is_saved: bool = False
    
    class Config:
        from_attributes = True

# --- Enhanced Feature Schemas ---

class WordUpdate(BaseModel):
    word: Optional[str] = None
    meaning: Optional[str] = None
    level: Optional[str] = None
    is_active: Optional[bool] = None

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    description: Optional[str] = None
    
class AnswerCreate(AnswerBase):
    context_tags: Optional[str] = None

class AnswerUpdate(BaseModel):
    answer_text: Optional[str] = None
    is_edited: bool = True

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_published: Optional[bool] = None

class FilterParams(BaseModel):
    skip: int = 0
    limit: int = 10
    search: Optional[str] = None
    language_id: Optional[str] = None
    level: Optional[str] = None
    user_id: Optional[str] = None


class NotificationBase(BaseModel):
    title: str
    message: str
    
class NotificationOut(NotificationBase):
    id: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: bool = True

class SavedContentOut(BaseModel):
    id: str
    content_type: str
    content_id: str
    created_at: datetime
    # Generic payload for frontend details (title, text, user, etc.)
    details: Optional[dict] = None 
    
    class Config:
        from_attributes = True

class WeeklyChampion(BaseModel):
    user: UserOut
    accepted_count: int
    score: int
    
    class Config:
        from_attributes = True

# Pydantic v2 / v1 compatibility for forward refs
try:
    UserOut.model_rebuild()
except AttributeError:
    UserOut.update_forward_refs()


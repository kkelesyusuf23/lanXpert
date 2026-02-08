from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Date, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import datetime
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

# --- Auth & User ---

class Role(Base):
    __tablename__ = "roles"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True) # admin, user, moderator

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    
    native_language_id = Column(String, ForeignKey("languages.id"), nullable=True)
    target_language_id = Column(String, ForeignKey("languages.id"), nullable=True)
    interface_language_id = Column(String, ForeignKey("languages.id"), nullable=True)
    
    plan_id = Column(String, ForeignKey("plans.id"), nullable=True)
    
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True) # Token for email verification
    phone_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Stats
    xp = Column(Integer, default=0)
    current_level = Column(String, default="Beginner")
    streak_days = Column(Integer, default=0)
    last_activity_date = Column(Date, nullable=True)

    # Relationships
    native_language = relationship("Language", foreign_keys=[native_language_id])
    target_language = relationship("Language", foreign_keys=[target_language_id])
    plan = relationship("Plan")
    
    questions = relationship("Question", back_populates="user")
    answers = relationship("Answer", back_populates="user")
    articles = relationship("Article", back_populates="user")
    refresh_tokens = relationship("RefreshToken", back_populates="user")
    
    notifications = relationship("Notification", back_populates="user")
    notification_settings = relationship("NotificationSetting", uselist=False, back_populates="user")
    roles = relationship("UserRole", back_populates="user")
    daily_limits = relationship("UserDailyLimit", back_populates="user")

class UserRole(Base):
    __tablename__ = "user_roles"
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    role_id = Column(String, ForeignKey("roles.id"), primary_key=True)
    
    user = relationship("User", back_populates="roles")
    role = relationship("Role")

class LoginLog(Base):
    __tablename__ = "login_logs"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    ip_address = Column(String)
    user_agent = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# --- Plans & Limits ---

class Plan(Base):
    __tablename__ = "plans"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True) # Free, Pro, Plus
    price = Column(Numeric, default=0)
    
    daily_word_limit = Column(Integer, default=10)
    daily_question_limit = Column(Integer, default=10)
    daily_answer_limit = Column(Integer, default=20)
    daily_article_limit = Column(Integer, default=1)
    
    is_active = Column(Boolean, default=True)

class UserDailyLimit(Base):
    __tablename__ = "user_daily_limits"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    date = Column(Date, default=datetime.date.today)
    
    used_words = Column(Integer, default=0)
    used_questions = Column(Integer, default=0)
    used_answers = Column(Integer, default=0)
    used_articles = Column(Integer, default=0)
    
    user = relationship("User", back_populates="daily_limits")

class RateLimitLog(Base):
    __tablename__ = "rate_limit_logs"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    action_type = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# --- Language & Content ---

class Language(Base):
    __tablename__ = "languages"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, index=True) # en, tr, fr
    name = Column(String) 

class Word(Base):
    __tablename__ = "words"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    language_id = Column(String, ForeignKey("languages.id"))
    word = Column(String)
    meaning = Column(Text)
    part_of_speech = Column(String) # noun, verb, adj
    level = Column(String) # A1-C2
    is_active = Column(Boolean, default=True)

class WordLog(Base):
    __tablename__ = "word_logs"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    word_id = Column(String, ForeignKey("words.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# --- Q&A ---

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    
    source_language_id = Column(String, ForeignKey("languages.id"))
    target_language_id = Column(String, ForeignKey("languages.id"))
    
    question_text = Column(Text)
    description = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="questions")
    answers = relationship("Answer", back_populates="question")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=generate_uuid)
    question_id = Column(String, ForeignKey("questions.id"))
    user_id = Column(String, ForeignKey("users.id"))
    
    answer_text = Column(Text)
    is_edited = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    question = relationship("Question", back_populates="answers")
    user = relationship("User", back_populates="answers")
    votes = relationship("AnswerVote", back_populates="answer")
    reports = relationship("AnswerReport", back_populates="answer")

class AnswerVote(Base):
    __tablename__ = "answer_votes"
    id = Column(String, primary_key=True, default=generate_uuid)
    answer_id = Column(String, ForeignKey("answers.id"))
    user_id = Column(String, ForeignKey("users.id"))
    vote_type = Column(Boolean) # True=Up, False=Down
    
    answer = relationship("Answer", back_populates="votes")

class AnswerReport(Base):
    __tablename__ = "answer_reports"
    id = Column(String, primary_key=True, default=generate_uuid)
    answer_id = Column(String, ForeignKey("answers.id"))
    user_id = Column(String, ForeignKey("users.id"))
    reason = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    answer = relationship("Answer", back_populates="reports")

# --- Articles ---

class Article(Base):
    __tablename__ = "articles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    language_id = Column(String, ForeignKey("languages.id"))
    
    title = Column(String)
    content = Column(Text)
    is_published = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="articles")
    likes = relationship("ArticleLike", back_populates="article")

class ArticleLike(Base):
    __tablename__ = "article_likes"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    article_id = Column(String, ForeignKey("articles.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
    article = relationship("Article", back_populates="likes")

# --- Notifications ---

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="notifications")

class NotificationSetting(Base):
    __tablename__ = "notification_settings"
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    email_enabled = Column(Boolean, default=True)
    in_app_enabled = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="notification_settings")

# --- Admin & System ---

class AdminAction(Base):
    __tablename__ = "admin_actions"
    id = Column(String, primary_key=True, default=generate_uuid)
    admin_id = Column(String, ForeignKey("users.id"))
    action = Column(String)
    target_table = Column(String)
    target_id = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SiteSetting(Base):
    __tablename__ = "site_settings"
    key = Column(String, primary_key=True)
    value = Column(String)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ContentModeration(Base):
    __tablename__ = "content_moderation"
    id = Column(String, primary_key=True, default=generate_uuid)
    content_type = Column(String) # question, answer, article
    content_id = Column(String)
    status = Column(String) # pending, approved, rejected
    moderator_id = Column(String, ForeignKey("users.id"), nullable=True)

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(String, primary_key=True, default=generate_uuid)
    token = Column(String, unique=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    expires_at = Column(DateTime)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="refresh_tokens")

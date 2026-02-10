from sqlalchemy.orm import Session
from sqlalchemy import orm
from datetime import datetime, timedelta
from typing import Optional
from . import models, schemas, auth

def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

from sqlalchemy import or_

def get_user_by_username(db: Session, username: str):
    # Allow login by username OR email
    user = db.query(models.User).filter(or_(models.User.username == username, models.User.email == username)).first()
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

def update_user_stats(db: Session, user: models.User, xp_gain: int = 0):
    try:
        import datetime
        from datetime import date
        
        # Re-fetch user in the current session context to avoid cross-session issues
        db_user = db.query(models.User).filter(models.User.id == user.id).first()
        if not db_user:
            print(f"ERROR: User {user.id} not found for stats update")
            return user
            
        print(f"DEBUG: Updating stats for user {db_user.id}. Current XP: {db_user.xp}")

        # 1. Update XP
        if xp_gain > 0:
            db_user.xp = (db_user.xp or 0) + xp_gain
            
            # Level Logic
            xp = db_user.xp
            if xp < 100: db_user.current_level = "Beginner"
            elif xp < 500: db_user.current_level = "A1 Elementary"
            elif xp < 1000: db_user.current_level = "A2 Pre-Intermediate"
            elif xp < 2000: db_user.current_level = "B1 Intermediate"
            elif xp < 4000: db_user.current_level = "B2 Upper-Intermediate"
            else: db_user.current_level = "C1 Advanced"

        # 2. Update Streak
        today = date.today()
        last_date = db_user.last_activity_date
        
        if last_date != today:
            # Check if consecutive day
            is_consecutive = last_date == today - datetime.timedelta(days=1)
            
            if is_consecutive:
                db_user.streak_days = (db_user.streak_days or 0) + 1
            else:
                # If last_date is None OR last_date is older than yesterday
                # Safe check: if it's not today and not yesterday, it's a broken streak (or new)
                # We already checked != today
                db_user.streak_days = 1
                     
            db_user.last_activity_date = today

        db.add(db_user)
        # db.commit()  <- Let caller handle commit if part of larger transaction
        # db.refresh(db_user)
        return db_user
    except Exception as e:
        print(f"ERROR in update_user_stats: {e}")
        import traceback
        traceback.print_exc()
        return user

def update_user_streak(db: Session, user: models.User):
    # Deprecated in favor of update_user_stats but kept for compatibility
    update_user_stats(db, user, xp_gain=0)

def increment_daily_counter(db: Session, user_id: str, counter_type: str):
    # counter_type: 'words', 'questions', 'answers', 'articles'
    from datetime import date
    try:
        daily_limit = db.query(models.UserDailyLimit).filter(
            models.UserDailyLimit.user_id == user_id,
            models.UserDailyLimit.date == date.today()
        ).first()
        
        if not daily_limit:
            daily_limit = models.UserDailyLimit(user_id=user_id, date=date.today())
            db.add(daily_limit)
            
        if counter_type == 'words':
            daily_limit.used_words = (daily_limit.used_words or 0) + 1
        elif counter_type == 'questions':
            daily_limit.used_questions = (daily_limit.used_questions or 0) + 1
        elif counter_type == 'answers':
            daily_limit.used_answers = (daily_limit.used_answers or 0) + 1
        elif counter_type == 'articles':
            daily_limit.used_articles = (daily_limit.used_articles or 0) + 1
            
        db.add(daily_limit)
        return daily_limit
    except Exception as e:
        print(f"Error incrementing daily counter: {e}")

# --- Feature CRUD ---

def toggle_save_content(db: Session, user_id: str, content_type: str, content_id: str):
    existing = db.query(models.UserSavedContent).filter(
        models.UserSavedContent.user_id == user_id,
        models.UserSavedContent.content_type == content_type,
        models.UserSavedContent.content_id == content_id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return False # Removed
    else:
        new_save = models.UserSavedContent(
            user_id=user_id,
            content_type=content_type,
            content_id=content_id
        )
        db.add(new_save)
        db.commit()
        return True # Saved

def get_user_saved_content(db: Session, user_id: str, content_type: str = None):
    query = db.query(models.UserSavedContent).filter(models.UserSavedContent.user_id == user_id)
    if content_type:
        query = query.filter(models.UserSavedContent.content_type == content_type)
    
    saved_items = query.order_by(models.UserSavedContent.created_at.desc()).all()
    
    # Enrich with details
    # This isn't the most efficient SQL (N+1 if we iterate), better to batch fetch.
    
    question_ids = [item.content_id for item in saved_items if item.content_type == 'question']
    article_ids = [item.content_id for item in saved_items if item.content_type == 'article']
    
    questions = {}
    if question_ids:
        qs = db.query(models.Question).options(
            orm.joinedload(models.Question.user)
        ).filter(models.Question.id.in_(question_ids)).all()
        questions = {q.id: q for q in qs}
        
    articles = {}
    if article_ids:
        arts = db.query(models.Article).options(
            orm.joinedload(models.Article.user)
        ).filter(models.Article.id.in_(article_ids)).all()
        articles = {a.id: a for a in arts}
        
    results = []
    for item in saved_items:
        details = {}
        if item.content_type == 'question':
             q = questions.get(item.content_id)
             if q:
                 details = {
                     "text": q.question_text,
                     "description": q.description,
                     "author": q.user.username if q.user else "Unknown"
                 }
        elif item.content_type == 'article':
             a = articles.get(item.content_id)
             if a:
                 details = {
                     "title": a.title,
                     "author": a.user.username if a.user else "Unknown"
                 }
                 
        # Create Pydantic model manually or attach to ORM object if using standard approach
        # Since we return ORM objects usually, we can attach a temporary attribute 'details'
        item.details = details
        results.append(item)
        
    return results

def mark_answer_helpful(db: Session, user_id: str, answer_id: str):
    # Check if already marked
    existing = db.query(models.AnswerHelpful).filter(
        models.AnswerHelpful.user_id == user_id,
        models.AnswerHelpful.answer_id == answer_id
    ).first()
    
    if existing:
        return False # Already helpful
        
    # Add mark
    new_mark = models.AnswerHelpful(user_id=user_id, answer_id=answer_id)
    db.add(new_mark)
    
    # Increment count
    answer = db.query(models.Answer).filter(models.Answer.id == answer_id).first()
    if answer:
        answer.helpful_count = (answer.helpful_count or 0) + 1
        
        # Award XP to answer owner (e.g., 5 XP)
        if answer.user_id != user_id: # Don't reward self-help
             update_user_stats(db, answer.user, xp_gain=5)
             
    db.commit()
    return True

def get_daily_sentence(db: Session):
    # Logic: Get a random question with accepted answer or high votes from last 24h
    # For MVP: Just get latest high voted answer
    from sqlalchemy import desc
    from datetime import datetime, timedelta
    
    # Time window: Last 24 hours
    since = datetime.utcnow() - timedelta(hours=24)
    
    # Try to find recent top answer (created in last 24h OR marked helpful recently? 
    # Usually featured items are freshly popular. Let's look for high helpful count answers created recently.
    top_answer = db.query(models.Answer).filter(
        models.Answer.helpful_count > 0,
        models.Answer.created_at >= since
    ).order_by(desc(models.Answer.helpful_count)).first()
    
    if top_answer:
        return top_answer
        
    # Fallback 1: Any high voted answer from anytime (if no recent ones)
    top_all_time = db.query(models.Answer).filter(
        models.Answer.helpful_count > 0
    ).order_by(desc(models.Answer.helpful_count)).first()
    
    if top_all_time:
        return top_all_time

    # Fallback 2: Any recent answer
    return db.query(models.Answer).order_by(desc(models.Answer.created_at)).first()

def get_weekly_champion(db: Session):
    # Logic: User with most accepted answers or XP in last 7 days
    # Requires tracking XP history or complex query. 
    # MVP: User with highest XP total (simple) or daily stats aggregation
    from sqlalchemy import desc
    return db.query(models.User).order_by(desc(models.User.xp)).first()

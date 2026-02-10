from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    responses={404: {"description": "Not found"}},
    dependencies=[Depends(dependencies.get_current_admin_user)]
)

@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    user_count = db.query(models.User).count()
    word_count = db.query(models.Word).count()
    article_count = db.query(models.Article).count()
    question_count = db.query(models.Question).count()
    
    return {
        "users": user_count,
        "words": word_count,
        "articles": article_count,
        "questions": question_count
    }

@router.get("/users", response_model=List[schemas.UserOut], dependencies=[Depends(dependencies.get_current_super_admin)])
def get_users(skip: int = 0, limit: int = 50, search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.User)
    if search:
        query = query.filter(models.User.username.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

@router.put("/users/{user_id}/toggle-active", dependencies=[Depends(dependencies.get_current_super_admin)])
def toggle_user_active(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"status": "success", "is_active": user.is_active}

@router.put("/users/{user_id}/promote", dependencies=[Depends(dependencies.get_current_super_admin)])
def promote_user(user_id: str, role: str, db: Session = Depends(get_db)):
    # Simple role assignment logic
    # First check if role exists
    role_obj = db.query(models.Role).filter(models.Role.name == role).first()
    if not role_obj:
        # Create role if not exists (for simplicity in this setup)
        role_obj = models.Role(name=role)
        db.add(role_obj)
        db.commit()
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user already has role
    user_role = db.query(models.UserRole).filter(
        models.UserRole.user_id == user.id, 
        models.UserRole.role_id == role_obj.id
    ).first()
    
    if not user_role:
        new_role = models.UserRole(user_id=user.id, role_id=role_obj.id)
        db.add(new_role)
        db.commit()
        
    return {"status": "success", "message": f"User promoted to {role}"}

@router.delete("/users/{user_id}/roles/{role_name}", dependencies=[Depends(dependencies.get_current_super_admin)])
def remove_user_role(user_id: str, role_name: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    role_obj = db.query(models.Role).filter(models.Role.name == role_name).first()
    if not role_obj:
         raise HTTPException(status_code=404, detail="Role not found")
         
    user_role = db.query(models.UserRole).filter(
        models.UserRole.user_id == user.id,
        models.UserRole.role_id == role_obj.id
    ).first()
    
    if user_role:
        db.delete(user_role)
        db.commit()
        
    return {"status": "success", "message": f"Role {role_name} removed"}

@router.post("/words")
def create_word(word_data: schemas.WordCreate, db: Session = Depends(get_db)):
    # Check duplicate?
    new_word = models.Word(**word_data.dict())
    db.add(new_word)
    db.commit()
    return {"status": "success", "id": new_word.id}

@router.get("/words", response_model=List[schemas.WordOut])
def get_words(
    skip: int = 0, 
    limit: int = 50, 
    search: Optional[str] = None, 
    level: Optional[str] = None,
    part_of_speech: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Word)
    
    if search:
        # Search in word AND meaning for better "search all" experience
        from sqlalchemy import or_
        query = query.filter(
            or_(
                models.Word.word.ilike(f"%{search}%"),
                models.Word.meaning.ilike(f"%{search}%")
            )
        )
        
    if level and level != "all":
        query = query.filter(models.Word.level == level)
        
    if part_of_speech and part_of_speech != "all":
        query = query.filter(models.Word.part_of_speech == part_of_speech)
        
    return query.order_by(models.Word.word.asc()).offset(skip).limit(limit).all()

@router.put("/words/{word_id}")
def update_word(word_id: str, word_data: schemas.WordCreate, db: Session = Depends(get_db)):
    word = db.query(models.Word).filter(models.Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")
    
    for key, value in word_data.dict().items():
        setattr(word, key, value)
        
    db.commit()
    db.refresh(word)
    return word

@router.delete("/words/{word_id}")
def delete_word(word_id: str, db: Session = Depends(get_db)):
    word = db.query(models.Word).filter(models.Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")
        
    db.delete(word)
    db.commit()
    return {"status": "deleted"}
@router.get("/questions", response_model=List[schemas.QuestionOut])
def get_questions(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    questions = db.query(models.Question).order_by(models.Question.created_at.desc()).offset(skip).limit(limit).all()
    
    # Ensure computed/default fields
    for q in questions:
        q.is_saved = False 
        if q.answers:
             for a in q.answers:
                a.is_helpful = False
        
    return questions

@router.post("/words/bulk")
def bulk_create_words(words_data: List[schemas.WordCreate], db: Session = Depends(get_db)):
    created_count = 0
    errors = []
    
    # Pre-fetch languages to map codes to IDs if needed
    languages = db.query(models.Language).all()
    lang_map = {l.code: l.id for l in languages}
    lang_ids = {l.id for l in languages}

    for word_in in words_data:
        try:
            # Validate/Fix Native Language ID
            lid = word_in.language_id
            if lid not in lang_ids:
                if lid in lang_map: lid = lang_map[lid]
                else: lid = None
            
            # Validate/Fix Target Language ID
            tid = word_in.target_language_id
            if tid and tid not in lang_ids:
                if tid in lang_map: tid = lang_map[tid]
                else: tid = None
            
            if not lid:
                errors.append(f"Invalid Native Language for {word_in.word}")
                continue

            # Check for duplicates (Word + Native + Target)
            query = db.query(models.Word).filter(models.Word.word.ilike(word_in.word))
            if lid: query = query.filter(models.Word.language_id == lid)
            if tid: query = query.filter(models.Word.target_language_id == tid)
            
            exists = query.first()
            
            if not exists:
                data = word_in.dict()
                data['language_id'] = lid
                data['target_language_id'] = tid
                new_word = models.Word(**data)
                db.add(new_word)
                created_count += 1
            else:
                 pass
                 
        except Exception as e:
            errors.append(f"Error adding {word_in.word}: {str(e)}")
            
    db.commit()
    return {"status": "success", "created": created_count, "errors": errors}

@router.delete("/questions/{question_id}")
def delete_question(question_id: str, db: Session = Depends(get_db)):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    # Cascade delete should handle answers, but manual cleanup is safer if not configured
    # Deleting answers first just in case
    db.query(models.Answer).filter(models.Answer.question_id == question_id).delete()
    db.delete(question)
    db.commit()
    return {"status": "deleted"}

@router.get("/articles", response_model=List[schemas.ArticleOut])
def get_articles(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    articles = db.query(models.Article).options(
        joinedload(models.Article.user)
    ).order_by(models.Article.created_at.desc()).offset(skip).limit(limit).all()
    
    # Needs handling for 'like_count' and 'is_liked' which are computed fields in ArticleOut schema
    # In admin view, we might not care about 'is_liked' by current admin user, but schema requires it.
    # We can default them.
    for a in articles:
        a.like_count = 0 # Admin view simplification or fetch real count
        a.is_liked = False
        
    return articles

@router.delete("/articles/{article_id}")
def delete_article(article_id: str, db: Session = Depends(get_db)):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    # Delete likes first
    db.query(models.ArticleLike).filter(models.ArticleLike.article_id == article_id).delete()
    db.delete(article)
    db.commit()
    return {"status": "deleted"}

@router.post("/users/{user_id}/reset-limits", dependencies=[Depends(dependencies.get_current_super_admin)])
def reset_user_limits(user_id: str, limit_type: str = "all", db: Session = Depends(get_db)):
    from datetime import date
    
    today = date.today()
    limit_record = db.query(models.UserDailyLimit).filter(
        models.UserDailyLimit.user_id == user_id,
        models.UserDailyLimit.date == today
    ).first()
    
    if not limit_record:
        # If no record exists for today, nothing to reset (limit is 0 used)
        return {"status": "success", "message": "No limits used today"}
        
    if limit_type == "all":
        limit_record.used_questions = 0
        limit_record.used_words = 0
        limit_record.used_articles = 0
    elif limit_type == "questions":
        limit_record.used_questions = 0
    elif limit_type == "words":
        limit_record.used_words = 0
    elif limit_type == "articles":
        limit_record.used_articles = 0
        
    db.commit()
    return {"status": "success", "message": "Limits reset"}

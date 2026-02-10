from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, dependencies, crud
from ..database import get_db
from ..repository import Repository
from ..features.users.create_user import CreateUserCommand

# --- Words Router (Full CRUD + Filtering) ---
router_words = APIRouter(prefix="/words", tags=["Words"])

# --- Other Feature Routers ---
router_questions = APIRouter(prefix="/questions", tags=["Questions"])
router_answers = APIRouter(prefix="/answers", tags=["Answers"])
router_articles = APIRouter(prefix="/articles", tags=["Articles"])
router_notifications = APIRouter(prefix="/notifications", tags=["Notifications"])


@router_words.get("/", response_model=List[schemas.WordOut])
def get_words(
    skip: int = 0, 
    limit: int = 10, 
    level: Optional[str] = None, 
    language_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    repo = Repository(models.Word, db)
    filters = {}
    if level: filters['level'] = level
    if language_id: filters['language_id'] = language_id
    
    return repo.get_all(skip=skip, limit=limit, filters=filters, order_by="word", descending=False)

@router_words.get("/random", response_model=schemas.WordOut)
def get_random_word(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    try:
        import random
        import datetime
        from datetime import date
        
        # 1. Check Daily Limits
        daily_limit = db.query(models.UserDailyLimit).filter(
            models.UserDailyLimit.user_id == current_user.id,
            models.UserDailyLimit.date == date.today()
        ).first()
        
        if not daily_limit:
            daily_limit = models.UserDailyLimit(user_id=current_user.id, date=date.today())
            db.add(daily_limit)
            db.commit()
            db.refresh(daily_limit)
            
        # Free Plan Logic (Assume no plan_id means Free)
        # 5 words limit
        if not current_user.plan_id and daily_limit.used_words >= 5:
            raise HTTPException(status_code=403, detail="Free plan limit reached (5 words/day). Please upgrade.")

        # 2. Get Random Word (Target Language)
        # Ideally filter by user's target language
        query = db.query(models.Word)
        # Filter by user's target language (Word language)
        # Filter by user's target language
        if current_user.target_language_id:
            query = query.filter(models.Word.target_language_id == current_user.target_language_id)
            
        # Filter by user's native language
        if current_user.native_language_id:
            query = query.filter(models.Word.language_id == current_user.native_language_id)
            
        count = query.count()

        if count == 0:
            # Fallback: Try to find ANY word if specific language query fails
            # This is a safety net so the user doesn't get stuck
            query = db.query(models.Word)
            count = query.count()
            if count == 0:
                 raise HTTPException(status_code=404, detail="No words found in the database. Please contact admin.")
        
        # Safe random offset
        if count > 0:
            random_offset = random.randint(0, count - 1)
            word = query.offset(random_offset).first()
        else:
            raise HTTPException(status_code=404, detail="No words available.")
        
        # 3. Increment Usage & Stats
        daily_limit.used_words += 1
        
        # Check if this word was already learned by user
        word_log = db.query(models.WordLog).filter(
            models.WordLog.user_id == current_user.id,
            models.WordLog.word_id == word.id
        ).first()
        
        if not word_log:
            new_log = models.WordLog(user_id=current_user.id, word_id=word.id)
            db.add(new_log)
            # Update Stats (+10 XP)
            crud.update_user_stats(db, current_user, xp_gain=10)
            db.commit() # Ensure log and stats are saved
        
        return word
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in get_random_word: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# ...

@router_questions.get("/", response_model=List[schemas.QuestionOut])
def get_questions(
    skip: int = 0, 
    limit: int = 10,
    source_lang: Optional[str] = None,
    target_lang: Optional[str] = None,
    user_id: Optional[str] = None,
    unanswered: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    from sqlalchemy.orm import joinedload
    repo = Repository(models.Question, db)
    
    # Custom query construction for complex filters
    query = db.query(models.Question)
    
    if source_lang:
        query = query.filter(models.Question.source_language_id == source_lang)
    if target_lang:
        query = query.filter(models.Question.target_language_id == target_lang)
    if user_id:
        query = query.filter(models.Question.user_id == user_id)
    if unanswered:
        # Check if answers list is empty (this might need left outer join check)
        # Using simple approach: questions with no answers
        query = query.outerjoin(models.Answer).filter(models.Answer.id == None)
        
    # Apply joined loads
    query = query.options(
        joinedload(models.Question.user), 
        joinedload(models.Question.answers).joinedload(models.Answer.user)
    )
    
    # Ordering
    query = query.order_by(models.Question.created_at.desc())
    
    # Pagination
    total = query.count()
    query = query.offset(skip).limit(limit)
    
    questions = query.all()
    
    # Check Saved Status
    if user_id: # Or current_user if available via dependency injection in future refactor
         # For now, let's just return as is, but ideally we inject current_user to check 'is_saved'
         # If the endpoint doesn't require auth, we can't check 'is_saved' for a specific user easily
         # unless we pass a token or ID.
         # Let's assume frontend handles visual state or we add optional auth.
         pass
         
    # To support is_saved in list view for authenticated users, we need current_user.
    # Since this endpoint is open (no auth required in arguments), we skip is_saved logic here 
    # OR we need to add optional auth dependency.
    
    return questions

@router_questions.post("/")
def create_question(question: schemas.QuestionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    try:
        # Manual creation
        payload = question.dict()
        payload['user_id'] = current_user.id
        new_q = models.Question(**payload)
        db.add(new_q)
        db.commit()
        
        # Update Stats (+20 XP)
        crud.update_user_stats(db, current_user, xp_gain=20)
        
        # Increment Daily Question Counter
        crud.increment_daily_counter(db, current_user.id, 'questions')
        
        db.commit()
        
        return {"status": "success", "id": new_q.id, "message": "Question created"}
    except Exception as e:
        print(f"Error creating question: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Creation Error: {str(e)}")

# ...

@router_answers.post("/", response_model=schemas.AnswerOut)
def create_answer(answer: schemas.AnswerCreate, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    repo = Repository(models.Answer, db)
    payload = answer.dict()
    payload['user_id'] = current_user.id
    new_answer = repo.create(payload)

    # Notification Logic
    question = db.query(models.Question).filter(models.Question.id == answer.question_id).first()
    if question and question.user_id != current_user.id:
        notification = models.Notification(
            user_id=question.user_id,
            title="New Answer",
            message=f"{current_user.username} answered your question: {question.question_text[:30]}..."
        )
        db.add(notification)
        db.commit()

    # Update Stats (+15 XP)
    crud.update_user_stats(db, current_user, xp_gain=15)
    db.commit()

    return new_answer

# ...

@router_articles.get("/", response_model=List[schemas.ArticleOut])
def get_articles(
    skip: int = 0, 
    limit: int = 10, 
    user_id: Optional[str] = None,
    current_user_id: Optional[str] = Query(None, alias="current_user_id"), 
    db: Session = Depends(get_db)
):
    from sqlalchemy.orm import joinedload
    from sqlalchemy import func
    
    repo = Repository(models.Article, db)
    
    filters = {}
    if user_id:
        filters['user_id'] = user_id
        
    articles = repo.get_all(
        skip=skip, 
        limit=limit, 
        filters=filters,
        setup_query=lambda q: q.options(joinedload(models.Article.user)), 
        order_by="created_at"
    )

    # Enhance with likes
    article_ids = [a.id for a in articles]
    
    if not article_ids:
        return []

    # Get Like Counts
    like_counts = db.query(
        models.ArticleLike.article_id, func.count(models.ArticleLike.id)
    ).filter(models.ArticleLike.article_id.in_(article_ids)).group_by(models.ArticleLike.article_id).all()
    
    like_map = {lc[0]: lc[1] for lc in like_counts}
    
    # Get User Likes
    liked_article_ids = set()
    if current_user_id:
        user_likes = db.query(models.ArticleLike.article_id).filter(
            models.ArticleLike.user_id == current_user_id,
            models.ArticleLike.article_id.in_(article_ids)
        ).all()
        liked_article_ids = {ul[0] for ul in user_likes}

    # Get User Saved Status
    saved_article_ids = set()
    if current_user_id:
        saved = db.query(models.UserSavedContent.content_id).filter(
            models.UserSavedContent.user_id == current_user_id,
            models.UserSavedContent.content_type == 'article',
            models.UserSavedContent.content_id.in_(article_ids)
        ).all()
        saved_article_ids = {s[0] for s in saved}

    results = []
    for a in articles:
        # Pydantic model conversion happens later, but we can attach attributes to ORM objects 
        # because Pydantic from_attributes=True will look for them.
        a.like_count = like_map.get(a.id, 0)
        a.is_liked = a.id in liked_article_ids
        a.is_saved = a.id in saved_article_ids
        results.append(a)
        
    return results

@router_articles.post("/{article_id}/like")
def toggle_article_like(
    article_id: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    # Check if already liked
    existing_like = db.query(models.ArticleLike).filter(
        models.ArticleLike.user_id == current_user.id,
        models.ArticleLike.article_id == article_id
    ).first()
    
    if existing_like:
        db.delete(existing_like)
        db.commit()
        return {"status": "unliked"}
    else:
        new_like = models.ArticleLike(user_id=current_user.id, article_id=article_id)
        db.add(new_like)
        
        # Notification Logic
        article = db.query(models.Article).filter(models.Article.id == article_id).first()
        if article and article.user_id != current_user.id:
            notification = models.Notification(
                user_id=article.user_id,
                title="New Like",
                message=f"{current_user.username} liked your article: {article.title}"
            )
            db.add(notification)
            
        db.commit()
        
        # Update Stats (+5 XP)
        crud.update_user_stats(db, current_user, xp_gain=5)
        db.commit()
        
        return {"status": "liked"}

@router_articles.post("/", response_model=schemas.ArticleOut)
def create_article(article: schemas.ArticleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    
    # Check Plan Limits (Free users: Max 1 Article)
    if not current_user.plan_id: # Assuming None is Free plan
        article_count = db.query(models.Article).filter(models.Article.user_id == current_user.id).count()
        if article_count >= 1:
            raise HTTPException(
                status_code=403, 
                detail="Free plan limit reached (1 Article). Please upgrade to post more."
            )

    try:
        import uuid
        new_id = str(uuid.uuid4())
        
        # Manual creation with explicit ID
        from datetime import datetime
        now = datetime.utcnow()
        
        new_article = models.Article(
            id=new_id,
            title=article.title,
            content=article.content,
            language_id=article.language_id,
            user_id=current_user.id,
            is_published=True, # Default to true for now
            created_at=now
        )
        db.add(new_article)
        db.commit()
        
        # Update Stats (+50 XP)
        crud.update_user_stats(db, current_user, xp_gain=50)
        db.commit()
        
        # ID is guaranteed to be set
        new_article.like_count = 0
        new_article.is_liked = False
        
        return new_article
    except Exception as e:
        print(f"ERROR creating article: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Creation Error: {str(e)}")

@router_articles.put("/{article_id}", response_model=schemas.ArticleOut)
def update_article(article_id: str, article: schemas.ArticleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    repo = Repository(models.Article, db)
    existing_article = repo.get(article_id)
    if not existing_article:
        raise HTTPException(status_code=404, detail="Article not found")
    if existing_article.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this article")
        
    return repo.update(existing_article, article.dict())

@router_articles.delete("/{article_id}")
def delete_article(article_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_active_user)):
    repo = Repository(models.Article, db)
    existing_article = repo.get(article_id)
    if not existing_article:
        raise HTTPException(status_code=404, detail="Article not found")
    if existing_article.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this article")
    
    repo.delete(article_id)
    return {"message": "Article deleted"}

@router_articles.post("/{article_id}/read")
def read_article_handler(
    article_id: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    # Check if article exists
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    # Increment Daily Article Counter (Reading Goal)
    crud.increment_daily_counter(db, current_user.id, 'articles')
    
    # Award XP for reading (e.g. 5 XP), ensure we don't spam XP for same article?
    # For now, simple logic: Reading awards XP.
    crud.update_user_stats(db, current_user, xp_gain=5)
    
    db.commit()
    return {"status": "success", "message": "Article marked as read"}

# --- Notifications Router ---


@router_notifications.get("/", response_model=List[schemas.NotificationOut])
def get_notifications(
    skip: int = 0, 
    limit: int = 20, 
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    query = db.query(models.Notification).filter(models.Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(models.Notification.is_read == False)
        
    return query.order_by(models.Notification.created_at.desc()).offset(skip).limit(limit).all()

@router_notifications.put("/{notification_id}/read", response_model=schemas.NotificationOut)
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@router_notifications.post("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({models.Notification.is_read: True}, synchronize_session=False)
    
    db.commit()
    db.commit()
    return {"message": "All notifications marked as read"}

# --- New Feature Endpoints ---

router_features = APIRouter(prefix="/features", tags=["New Features"])

@router_features.post("/save/{content_type}/{content_id}")
def toggle_save_content(
    content_type: str, 
    content_id: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    if content_type not in ['question', 'article', 'word']:
        raise HTTPException(status_code=400, detail="Invalid content type")
        
    is_saved = crud.toggle_save_content(db, current_user.id, content_type, content_id)
    return {"status": "success", "is_saved": is_saved}

@router_features.get("/saved", response_model=List[schemas.SavedContentOut])
def get_user_saved_content(
    content_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    return crud.get_user_saved_content(db, current_user.id, content_type)

@router_features.post("/helpful/{answer_id}")
def mark_answer_helpful(
    answer_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    success = crud.mark_answer_helpful(db, current_user.id, answer_id)
    if not success:
         return {"status": "ignored", "message": "Already marked helpful"}
    return {"status": "success", "message": "Marked as helpful"}

@router_features.get("/daily-sentence", response_model=Optional[schemas.AnswerOut])
def get_daily_content(db: Session = Depends(get_db)):
    return crud.get_daily_sentence(db)

@router_features.get("/weekly-champion", response_model=Optional[schemas.WeeklyChampion])
def get_weekly_champion_stats(db: Session = Depends(get_db)):
    champion = crud.get_weekly_champion(db)
    if not champion:
        return None
        
    # Mock data for now since we don't have detailed weekly stats table yet
    return {
        "user": champion,
        "accepted_count": 5, # Mock
        "score": champion.xp # Using total XP for now
    }

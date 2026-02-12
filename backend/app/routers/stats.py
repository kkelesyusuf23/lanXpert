from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import date, timedelta
from .. import models, schemas, dependencies
from ..database import get_db

router_stats = APIRouter(prefix="/stats", tags=["Stats"])

@router_stats.get("/overview")
def get_overview_stats(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    # 1. Total Vocabulary Learned (unique words)
    total_vocab = db.query(models.WordLog).filter(models.WordLog.user_id == current_user.id).count()
    
    # 2. Questions Asked (Total)
    total_questions = db.query(models.Question).filter(models.Question.user_id == current_user.id).count()
    
    # 3. Articles (Published/Read - simpler to count published for now)
    # If we had ArticleLog (read history), we would use that. 
    # For now, let's assume 'Articles Read' ~ 'Articles Published' OR use a placeholder if 0
    total_articles = db.query(models.Article).filter(models.Article.user_id == current_user.id).count()
    
    # 4. Weekly Progress (Date range check)
    today = date.today()
    week_ago = today - timedelta(days=7)
    
    vocab_this_week = db.query(models.WordLog).filter(
        models.WordLog.user_id == current_user.id, 
        models.WordLog.created_at >= week_ago
    ).count()
    
    questions_this_week = db.query(models.Question).filter(
        models.Question.user_id == current_user.id, 
        models.Question.created_at >= week_ago
    ).count()
    
    # 5. Streak & XP
    streak = current_user.streak_days or 0
    xp = current_user.xp or 0
    level = current_user.current_level or "Beginner"
    
    # Next Level calculation
    # If using simplified thresholds from features.py logic
    next_level_xp = 500
    if xp >= 25000: next_level_xp = 100000 # Max
    elif xp >= 10000: next_level_xp = 25000
    elif xp >= 5000: next_level_xp = 10000
    elif xp >= 2000: next_level_xp = 5000
    elif xp >= 500: next_level_xp = 2000
    
    progress_percentage = min(int((xp / next_level_xp) * 100), 100) if next_level_xp > 0 else 100

    return {
        "total_vocabulary": total_vocab,
        "vocab_this_week": vocab_this_week,
        "total_questions": total_questions,
        "questions_this_week": questions_this_week,
        "total_articles": total_articles,
        "current_streak": streak,
        "xp": xp,
        "level": level,
        "next_level_goal": next_level_xp,
        "level_progress": progress_percentage
    }

@router_stats.get("/activity")
def get_recent_activity(
    limit: int = 5,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    # Fetch recent Questions
    questions = db.query(models.Question).filter(models.Question.user_id == current_user.id).limit(limit).all()
    
    # Fetch recent Articles
    articles = db.query(models.Article).filter(models.Article.user_id == current_user.id).limit(limit).all()

    # Normalize and Combine
    activities = []
    
    for q in questions:
        activities.append({
            "type": "question",
            "title": q.question_text[:50] + "...",
            "date": q.created_at,
            "xp": 10 # dummy xp value
        })
        
    for a in articles:
        activities.append({
            "type": "article",
            "title": a.title,
            "date": a.created_at,
            "xp": 50 # dummy xp value
        })
        
    # Sort by date desc
    activities.sort(key=lambda x: x['date'], reverse=True)
    
    return activities[:limit]

@router_stats.get("/daily")
def get_daily_goals(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    from datetime import date
    
    # Get current user plan limits (or default free limits)
    # Default Free Defaults
    word_limit = 5
    question_limit = 2
    article_limit = 1
    
    if current_user.plan:
        word_limit = current_user.plan.daily_word_limit
        question_limit = current_user.plan.daily_question_limit
        article_limit = current_user.plan.daily_article_limit
        
    # Get Usage
    daily_limit = db.query(models.UserDailyLimit).filter(
        models.UserDailyLimit.user_id == current_user.id,
        models.UserDailyLimit.date == date.today()
    ).first()
    
    used_words = daily_limit.used_words if daily_limit else 0
    used_questions = daily_limit.used_questions if daily_limit else 0
    used_articles = daily_limit.used_articles if daily_limit else 0
    
    return {
        "words": {"current": used_words, "target": word_limit},
        "questions": {"current": used_questions, "target": question_limit},
        "articles": {"current": used_articles, "target": article_limit}
    }

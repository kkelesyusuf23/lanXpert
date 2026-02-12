from app.database import SessionLocal, engine
from app import models

def init_plans():
    db = SessionLocal()
    
    plans = [
        {
            "name": "Free",
            "price": 0,
            "daily_word_limit": 5,
            "daily_question_limit": 2,
            "daily_answer_limit": 5,
            "daily_article_limit": 1
        },
        {
            "name": "Pro",
            "price": 10,
            "daily_word_limit": 50,
            "daily_question_limit": 20,
            "daily_answer_limit": 50,
            "daily_article_limit": 10
        },
        {
            "name": "Enterprise",
            "price": 50,
            "daily_word_limit": 1000,
            "daily_question_limit": 1000,
            "daily_answer_limit": 1000,
            "daily_article_limit": 1000
        }
    ]

    print("Initializing plans...")
    
    for plan_data in plans:
        existing = db.query(models.Plan).filter(models.Plan.name == plan_data["name"]).first()
        if not existing:
            print(f"Creating plan: {plan_data['name']}")
            new_plan = models.Plan(**plan_data)
            db.add(new_plan)
        else:
            print(f"Plan {plan_data['name']} already exists. Updating limits if changed...")
            # Optional: update limits if logic requires, for now just skip or update
            for k, v in plan_data.items():
                setattr(existing, k, v)
    
    db.commit()
    db.close()
    print("Plans initialized successfully.")

if __name__ == "__main__":
    init_plans()

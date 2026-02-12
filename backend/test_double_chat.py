
import requests
import sys

# Change these to match your local environment
BASE_URL = "http://127.0.0.1:8000/api/v1"

# We need valid tokens. Since I can't easily get tokens without a login flow involving passwords...
# I will assume I can use the backend directly or mock the requests if I had tokens.
# Instead, I will use a Python script that uses the Database directly to simulate the API logic exactly.

from app.database import SessionLocal
from app import models, schemas
from sqlalchemy import func
import time

def simulate_double_random_chat():
    db = SessionLocal()
    print("--- Simulating Double Random Chat ---")
    
    # Get 2 Users
    users = db.query(models.User).all()
    if len(users) < 2:
        print("Need at least 2 users.")
        return
        
    u1 = users[0]
    u2 = users[1]
    
    print(f"User 1: {u1.username}")
    print(f"User 2: {u2.username}")
    
    # 1. User 1 starts (creates queue)
    print("\n[1] User 1 requests chat...")
    q1 = join_random_logic(db, u1)
    print(f"Result: Chat {q1.id} ({q1.type})")
    
    # 2. User 2 starts (joins queue)
    print("\n[2] User 2 requests chat...")
    q2 = join_random_logic(db, u2)
    print(f"Result: Chat {q2.id} ({q2.type})")
    
    if q1.id != q2.id:
        print("(!) User 2 did not join User 1's chat!")
    else:
        print("(Success) User 2 joined User 1's chat.")
        
    # 3. User 1 starts AGAIN
    print("\n[3] User 1 requests chat AGAIN...")
    try:
        q3 = join_random_logic(db, u1)
        print(f"Result: Chat {q3.id} ({q3.type})")
        print("(Success) User 1 created/joined a NEW chat while in an active one.")
    except Exception as e:
        print(f"(!) FAILED: {e}")
        import traceback
        traceback.print_exc()

def join_random_logic(db, current_user):
    # Copy-paste of the exact logic from chat.py
    
    # Check target language (Mandatory)
    if not current_user.target_language_id:
            raise Exception("Please set your target language in settings first.")
        
    # Check if already in a queue (Wait or return existing)
    existing_queue_p = db.query(models.ChatParticipant).join(models.Chat).filter(
        models.ChatParticipant.user_id == current_user.id,
        models.Chat.type == 'random_queue'
    ).first()
    
    if existing_queue_p:
        return db.query(models.Chat).get(existing_queue_p.chat_id)

    # Find a match
    potential_queues = db.query(models.Chat).filter(
        models.Chat.type == 'random_queue'
    ).all()
    
    best_match = None
    fallback_match = None
    
    for pq in potential_queues:
        parts = db.query(models.ChatParticipant).filter(models.ChatParticipant.chat_id == pq.id).all()
        
        if len(parts) != 1: continue
        p_user_id = parts[0].user_id
        if p_user_id == current_user.id: continue 
        
        p_user = db.query(models.User).get(p_user_id)
        if not p_user: continue
        
        if p_user.native_language_id == current_user.target_language_id:
            best_match = pq
            break 
        
        if not fallback_match:
            fallback_match = pq
    
    target_chat = best_match or fallback_match
    
    if target_chat:
        target_chat.type = 'random'
        target_chat.updated_at = func.now()
        
        new_p = models.ChatParticipant(chat_id=target_chat.id, user_id=current_user.id)
        db.add(new_p)
        
        # System Msg Logic skipped for brevity, assuming DB integrity logic is key
        sys_msg = models.Message(chat_id=target_chat.id, content="DEBUG MSG")
        db.add(sys_msg)
        
        db.commit()
        db.refresh(target_chat)
        return target_chat
        
    else:
        new_chat = models.Chat(type='random_queue')
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        
        p = models.ChatParticipant(chat_id=new_chat.id, user_id=current_user.id)
        db.add(p)
        db.commit()
        
        return new_chat

if __name__ == "__main__":
    simulate_double_random_chat()

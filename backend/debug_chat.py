import sys
from app.database import SessionLocal
from app import models, schemas
from sqlalchemy import func

def debug_random_chat():
    db = SessionLocal()
    try:
        print("--- Debugging Random Chat Logic ---")
        
        # 1. Get a user to act as 'current_user'
        # Let's pick the first user who has a target_language_id
        user = db.query(models.User).filter(models.User.target_language_id.isnot(None)).first()
        
        if not user:
            print("No suitable user found with target_language_id set. Cannot test.")
            # Let's pick ANY user and see
            user = db.query(models.User).first()
            if user:
                print(f"Picked user {user.username} (ID: {user.id}) but they have no target language.")
            else:
                print("No users in DB.")
                return

        print(f"Testing with User: {user.username} (ID: {user.id})")
        print(f"Native Lang ID: {user.native_language_id}")
        print(f"Target Lang ID: {user.target_language_id}")
        
        if not user.target_language_id:
            print("(!) User missing target language. This would cause 400 error in API.")
            # Let's give them a language if possible for testing
            lang = db.query(models.Language).first()
            if lang:
                print(f"Temporarily setting target lang to {lang.name}")
                user.target_language_id = lang.id
                db.commit()
            else:
                print("No languages found in DB!")
                return

        # 2. Simulate logic
        print("\n--- Simulating Logic ---")
        
        # Check existing queue
        existing_queue_p = db.query(models.ChatParticipant).join(models.Chat).filter(
            models.ChatParticipant.user_id == user.id,
            models.Chat.type == 'random_queue'
        ).first()
        
        if existing_queue_p:
            print(f"User is already in queue chat {existing_queue_p.chat_id}")
            return

        # Find match
        potential_queues = db.query(models.Chat).filter(
            models.Chat.type == 'random_queue'
        ).all()
        
        print(f"Found {len(potential_queues)} potential 'random_queue' chats.")
        
        target_chat = None
        
        for pq in potential_queues:
            parts = db.query(models.ChatParticipant).filter(models.ChatParticipant.chat_id == pq.id).all()
            print(f" - Chat {pq.id}: {len(parts)} participants")
            
            if len(parts) != 1:
                print("   -> Skipping (invalid participant count)")
                continue
                
            p_user_id = parts[0].user_id
            if p_user_id == user.id:
                print("   -> Skipping (self)")
                continue
            
            p_user = db.query(models.User).get(p_user_id)
            if not p_user:
                print("   -> Skipping (participant user not found)")
                continue
                
            print(f"   -> Participant: {p_user.username}, Native: {p_user.native_language_id}")
            
            if p_user.native_language_id == user.target_language_id:
                print("   -> MATCH! Native matches target.")
                target_chat = pq
                break
                
            if not target_chat:
                target_chat = pq # Fallback
                print("   -> Set as fallback match.")

        if target_chat:
            print(f"\nResult: would join chat {target_chat.id}")
            # Try to actually commit the join to see if DB errors occur
            try:
                target_chat.type = 'random'
                target_chat.updated_at = func.now()
                new_p = models.ChatParticipant(chat_id=target_chat.id, user_id=user.id)
                db.add(new_p)
                db.commit()
                print("Successfully joined chat (DB Commit Passed).")
            except Exception as e:
                print(f"(!) DB Commit Failed during JOIN: {e}")
                db.rollback()
        else:
            print("\nResult: would create NEW queue")
            try:
                new_chat = models.Chat(type='random_queue')
                db.add(new_chat)
                db.commit() # Commit chat first to get ID
                
                print(f"Created chat {new_chat.id}")
                
                p = models.ChatParticipant(chat_id=new_chat.id, user_id=user.id)
                db.add(p)
                db.commit()
                print("Successfully created queue (DB Commit Passed).")
            except Exception as e:
                print(f"(!) DB Commit Failed during CREATE: {e}")
                db.rollback()

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_random_chat()

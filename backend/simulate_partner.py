from app.database import SessionLocal
from app import models
from sqlalchemy import func

def simulate_waiting_partner():
    db = SessionLocal()
    try:
        # 1. Find the current user who is likely stuck in queue (yuke)
        # We saw ID 466b2928-3a53-4e6a-8861-18d302892a6a in logs
        yuke_id = "466b2928-3a53-4e6a-8861-18d302892a6a"
        
        # 2. Find ANY other user to be the partner
        partner = db.query(models.User).filter(models.User.id != yuke_id).first()
        
        if not partner:
            print("No other users found in DB to act as partner!")
            # Create one?
            return

        print(f"Found partner user: {partner.username} (ID: {partner.id})")
        
        # 3. Check if yuke is in a queue
        yuke_queue = db.query(models.ChatParticipant).join(models.Chat).filter(
            models.ChatParticipant.user_id == yuke_id,
            models.Chat.type == 'random_queue'
        ).first()

        if yuke_queue:
            print(f"Yuke is waiting in queue chat {yuke_queue.chat_id}")
            print(f"Simulating {partner.username} joining Yuke's chat...")
            
            chat = db.query(models.Chat).get(yuke_queue.chat_id)
            chat.type = 'random'
            chat.updated_at = func.now()
            
            new_p = models.ChatParticipant(chat_id=chat.id, user_id=partner.id)
            db.add(new_p)
            
            msg = models.Message(
                chat_id=chat.id, 
                content=f"Connected! Partner found: {partner.username}"
            )
            db.add(msg)
            
            db.commit()
            print("Successfully matched! Yuke should see the chat now.")
            
        else:
            print("Yuke is NOT in a queue. Creating a queue for the PARTNER so Yuke can find them.")
            
            # Create queue for partner
            chat = models.Chat(type='random_queue')
            db.add(chat)
            db.commit()
            
            p = models.ChatParticipant(chat_id=chat.id, user_id=partner.id)
            db.add(p)
            db.commit()
            
            print(f"Created queue {chat.id} for {partner.username}. Ask Yuke to click Random Chat now.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    simulate_waiting_partner()

from app.database import SessionLocal
from app import models

def cleanup_chat_queues():
    db = SessionLocal()
    try:
        # Find all random_queue chats
        queues = db.query(models.Chat).filter(models.Chat.type == 'random_queue').all()
        print(f"Found {len(queues)} mixed queue/random chats.")
        
        count = 0
        for chat in queues:
            # Check participants
            parts = db.query(models.ChatParticipant).filter(models.ChatParticipant.chat_id == chat.id).all()
            if len(parts) == 0:
                print(f"Deleting empty queue chat {chat.id}")
                db.delete(chat)
                count += 1
            elif len(parts) > 1:
                 # Should be 'random' not 'random_queue'
                 print(f"Fixing chat {chat.id} with {len(parts)} participants to 'random'")
                 chat.type = 'random'
                 count += 1
        
        db.commit()
        print(f"Cleaned/Fixed {count} chats.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_chat_queues()

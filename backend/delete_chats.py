from app.database import SessionLocal
from app import models
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def delete_all_chats():
    db = SessionLocal()
    try:
        logger.info("Starting cleanup of all chat data...")
        
        # Order matters due to foreign key constraints
        # 1. Messages (depend on chats and users)
        deleted_msgs = db.query(models.Message).delete()
        logger.info(f"Deleted {deleted_msgs} messages.")
        
        # 2. Chat Participants (depend on chats and users)
        deleted_parts = db.query(models.ChatParticipant).delete()
        logger.info(f"Deleted {deleted_parts} chat participants.")
        
        # 3. Chats
        deleted_chats = db.query(models.Chat).delete()
        logger.info(f"Deleted {deleted_chats} chats.")
        
        db.commit()
        logger.info("All chat data deleted successfully.")
        
    except Exception as e:
        logger.error(f"Error deleting chat data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    delete_all_chats()

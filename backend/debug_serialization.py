from app.database import SessionLocal
from app import models, schemas
from sqlalchemy.orm import joinedload
from sqlalchemy import func

def test_serialization():
    db = SessionLocal()
    chat_id = "98abc150-d942-4919-ad3e-43574b6f32ec"  # From log
    
    try:
        print(f"Fetching chat {chat_id}...")
        chat = db.query(models.Chat).options(
            joinedload(models.Chat.participants).joinedload(models.ChatParticipant.user).joinedload(models.User.plan),
            joinedload(models.Chat.participants).joinedload(models.ChatParticipant.user).joinedload(models.User.native_language),
            joinedload(models.Chat.participants).joinedload(models.ChatParticipant.user).joinedload(models.User.target_language),
            joinedload(models.Chat.participants).joinedload(models.ChatParticipant.user).joinedload(models.User.roles)
        ).filter(models.Chat.id == chat_id).first()
        
        if not chat:
            print("Chat not found!")
            return

        print("Chat fetched. Attempting Pydantic serialization...")
        
        # Manually trigger Pydantic validation
        chat_out = schemas.ChatOut.model_validate(chat)
        
        print("Serialization SUCCESS!")
        print(chat_out.model_dump_json(indent=2))

    except Exception as e:
        print(f"Serialization FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_serialization()

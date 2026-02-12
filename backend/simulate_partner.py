from app.database import SessionLocal
from app import models
from sqlalchemy import func

def simulate_waiting_partner():
    db = SessionLocal()
    try:
        # 1. Find ANY user in a random_queue
        queue_entry = db.query(models.ChatParticipant).join(models.Chat).filter(
            models.Chat.type == 'random_queue'
        ).first()

        if not queue_entry:
            print("No users currently waiting in a queue.")
            # Create a queue for a random user so the real user can find them?
            # Find a user who is NOT me (assuming running script locally doesn't matter who "me" is)
            # Just pick the first user
            partner = db.query(models.User).first()
            if partner:
                print(f"Creating a queue for {partner.username} so YOU can match with them.")
                
                # Check if they are already in a queue to avoid duplicates
                existing = db.query(models.ChatParticipant).join(models.Chat).filter(
                    models.ChatParticipant.user_id == partner.id,
                    models.Chat.type == 'random_queue'
                ).first()
                
                if existing:
                    print(f"User {partner.username} is already in queue {existing.chat_id}")
                else:
                    new_chat = models.Chat(type='random_queue')
                    db.add(new_chat)
                    db.commit()
                    
                    p = models.ChatParticipant(chat_id=new_chat.id, user_id=partner.id)
                    db.add(p)
                    db.commit()
                    print(f"Created queue {new_chat.id} for {partner.username}.")
            return

        waiting_user_id = queue_entry.user_id
        chat_id = queue_entry.chat_id
        print(f"Found user {waiting_user_id} waiting in queue {chat_id}")

        # 2. Find a partner (anyone else)
        partner = db.query(models.User).filter(models.User.id != waiting_user_id).first()
        
        if not partner:
            print("No other users found to be the partner!")
            return

        print(f"Simulating {partner.username} (ID: {partner.id}) matching with them...")

        # 3. Match them!
        chat = db.query(models.Chat).get(chat_id)
        chat.type = 'random'
        chat.updated_at = func.now()
        
        # Check if partner already in? No, queues have 1 participant.
        
        new_p = models.ChatParticipant(chat_id=chat.id, user_id=partner.id)
        db.add(new_p)
        
        # Add system message
        msg = models.Message(
            chat_id=chat.id, 
            content=f"Connected! You are now chatting with {partner.username}."
        )
        db.add(msg)
        
        db.commit()
        print(f"Successfully matched in chat {chat.id}!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    simulate_waiting_partner()

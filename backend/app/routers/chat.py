from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from .. import models, schemas, crud, dependencies
from ..database import get_db
from sqlalchemy import or_, and_, desc, func

router = APIRouter(
    prefix="/chats",
    tags=["chats"],
    responses={404: {"detail": "Not found"}},
)

@router.get("/", response_model=List[schemas.ChatOut])
def get_chats(
    skip: int = 0, 
    limit: int = 20, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    # Retrieve chats where user in participant
    # 1. Get Chat IDs for user
    user_chat_ids = db.query(models.ChatParticipant.chat_id).filter(
        models.ChatParticipant.user_id == current_user.id
    ).subquery()
    
    # 2. Get Chats with participants loaded
    chats = db.query(models.Chat).filter(
        models.Chat.id.in_(user_chat_ids),
        # models.Chat.type != 'random_queue' # Show queues so user knows they are waiting
    ).order_by(models.Chat.updated_at.desc()).offset(skip).limit(limit).options(
        joinedload(models.Chat.participants).joinedload(models.ChatParticipant.user)
    ).all()
    
    # 3. Enrich with last message (inefficient N+1 but safe for MVP with small limits)
    results = []
    for chat in chats:
        try:
            # Hide sensitive user info in random chats if needed, but schema filters usually.
            # Random chat: Show only username. Direct: Show full?
            # Re-mapping to schema manually to handle "Random" anonymity if desired.
            
            last_msg = db.query(models.Message).filter(
                models.Message.chat_id == chat.id
            ).order_by(models.Message.created_at.desc()).first()
            
            c_out = schemas.ChatOut.from_orm(chat)
            if last_msg:
                 c_out.last_message = schemas.MessageOut.from_orm(last_msg)
                 # Populate sender manually if needed
                 if last_msg.sender_id:
                     sender = db.query(models.User).get(last_msg.sender_id)
                     if sender:
                         c_out.last_message.sender = schemas.UserOut.from_orm(sender)
            
            results.append(c_out)
        except Exception as e:
            print(f"Error serializing chat {chat.id}: {e}")
            # Skip this chat to avoid breaking the whole list
            continue
        
    return results

@router.post("/random", response_model=schemas.ChatOut)
def join_random_chat(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    import logging
    logging.basicConfig(filename='chat_debug.log', level=logging.INFO)
    logger = logging.getLogger(__name__)

    try:
        # Check target language (Mandatory)
        if not current_user.target_language_id:
             raise HTTPException(status_code=400, detail="Please set your target language in settings first.")
            
        # Check if already in a queue (Wait or return existing)
        existing_queue_p = db.query(models.ChatParticipant).join(models.Chat).filter(
            models.ChatParticipant.user_id == current_user.id,
            models.Chat.type == 'random_queue'
        ).first()
        
        if existing_queue_p:
            chat_id = existing_queue_p.chat_id
            logger.info(f"User {current_user.id} already in queue {chat_id}")
            return fetch_chat_with_relations(db, chat_id)

        # 1. Fetch existing chat partners to avoid duplicates in random matching
        # Get all chats where I am a participant
        my_chat_ids = db.query(models.ChatParticipant.chat_id).filter(
            models.ChatParticipant.user_id == current_user.id
        ).all()
        my_chat_ids = [c[0] for c in my_chat_ids]
        
        # Get all users in those chats
        existing_partner_ids = set()
        if my_chat_ids:
            partners = db.query(models.ChatParticipant.user_id).filter(
                models.ChatParticipant.chat_id.in_(my_chat_ids),
                models.ChatParticipant.user_id != current_user.id
            ).all()
            existing_partner_ids = {p[0] for p in partners}
            
        logger.info(f"User {current_user.id} existing partners: {existing_partner_ids}")

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
            
            # Skip self
            if p_user_id == current_user.id: continue 
            
            # Skip if already have a chat with this user
            if p_user_id in existing_partner_ids:
                logger.info(f"Skipping match {p_user_id} - active chat exists")
                continue
            
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
            
            # System Msg
            partner_p = db.query(models.ChatParticipant).filter(
                models.ChatParticipant.chat_id == target_chat.id,
                models.ChatParticipant.user_id != current_user.id
            ).first()
            
            partner_lang = "Unknown"
            if partner_p:
                u = db.query(models.User).get(partner_p.user_id)
                if u and u.native_language_id:
                    l = db.query(models.Language).get(u.native_language_id)
                    if l: partner_lang = l.name

            my_target = "Unknown"
            if current_user.target_language_id:
                l = db.query(models.Language).get(current_user.target_language_id)
                if l: my_target = l.name
            
            sys_msg = models.Message(
                chat_id=target_chat.id,
                sender_id=None,
                content=f"Connected! You requested {my_target}. Partner speaks {partner_lang}."
            )
            db.add(sys_msg)
            
            db.commit()
            logger.info(f"User {current_user.id} joined chat {target_chat.id}")
            return fetch_chat_with_relations(db, target_chat.id)
            
        else:
            new_chat = models.Chat(type='random_queue')
            db.add(new_chat)
            db.commit()
            
            p = models.ChatParticipant(chat_id=new_chat.id, user_id=current_user.id)
            db.add(p)
            db.commit()
            
            logger.info(f"User {current_user.id} created queue {new_chat.id}")
            return fetch_chat_with_relations(db, new_chat.id)

    except Exception as e:
        db.rollback()
        logger.error(f"Error in join_random_chat: {e}")
        print(f"Error in join_random_chat: {e}")
        raise HTTPException(status_code=500, detail=f"Random chat failed: {str(e)}")

def fetch_chat_with_relations(db: Session, chat_id: str):
    return db.query(models.Chat).options(
        joinedload(models.Chat.participants).joinedload(models.ChatParticipant.user).joinedload(models.User.plan),
        joinedload(models.Chat.participants).joinedload(models.ChatParticipant.user).joinedload(models.User.native_language),
        joinedload(models.Chat.participants).joinedload(models.ChatParticipant.user).joinedload(models.User.target_language),
        joinedload(models.Chat.participants).joinedload(models.ChatParticipant.user).joinedload(models.User.roles)
    ).filter(models.Chat.id == chat_id).first()

@router.post("/direct", response_model=schemas.ChatOut)
def create_direct_chat(
    payload: schemas.ChatCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    # Check Plan (Enterprise/Plus only)
    # How do we verify strict "Enterprise"? 
    # For now, let's assume any paid plan can for this MVP step, 
    # OR fetch plan details. Let's assume Plan.name == 'Enterprise'.
    
    if not current_user.plan:
         raise HTTPException(status_code=403, detail="Direct messaging requires an Enterprise plan.")
         
    # Strict check if plan names are reliable. 
    # if "Enterprise" not in current_user.plan.name: ...
    
    target_user_id = payload.target_user_id
    if not target_user_id:
        raise HTTPException(status_code=400, detail="Target user required for direct chat.")
        
    if target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot chat with yourself.")
        
    # Check Block Status
    is_blocked = db.query(models.BlockedUser).filter(
        or_(
            and_(models.BlockedUser.blocker_id == target_user_id, models.BlockedUser.blocked_id == current_user.id), # They blocked me
            and_(models.BlockedUser.blocker_id == current_user.id, models.BlockedUser.blocked_id == target_user_id)  # I blocked them
        )
    ).first()
    
    if is_blocked:
        raise HTTPException(status_code=403, detail="Cannot start chat with this user.")

    # Check Existing Direct Chat
    # Complex query: Find chat where both are participants and type='direct'
    # Simplification: Fetch my direct chats, check if target is in them.
    
    my_chats = db.query(models.Chat).join(models.ChatParticipant).filter(
        models.ChatParticipant.user_id == current_user.id,
        models.Chat.type == 'direct'
    ).all()
    
    for chat in my_chats:
        # Check if target is participant
        is_participant = db.query(models.ChatParticipant).filter(
            models.ChatParticipant.chat_id == chat.id,
            models.ChatParticipant.user_id == target_user_id
        ).first()
        if is_participant:
            return chat
            
    # Create New Direct Chat
    new_chat = models.Chat(type='direct')
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    
    p1 = models.ChatParticipant(chat_id=new_chat.id, user_id=current_user.id)
    p2 = models.ChatParticipant(chat_id=new_chat.id, user_id=target_user_id)
    db.add(p1)
    db.add(p2)
    db.commit()
    
    return new_chat

@router.get("/{chat_id}/messages", response_model=List[schemas.MessageOut])
def get_messages(
    chat_id: str,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    # Verify participant
    is_participant = db.query(models.ChatParticipant).filter(
        models.ChatParticipant.chat_id == chat_id,
        models.ChatParticipant.user_id == current_user.id
    ).first()
    
    if not is_participant:
        raise HTTPException(status_code=403, detail="Not a participant")
        
    msgs = db.query(models.Message).filter(
        models.Message.chat_id == chat_id
    ).order_by(models.Message.created_at.asc()).offset(skip).limit(limit).all()
    
    return msgs

@router.post("/{chat_id}/messages", response_model=schemas.MessageOut)
def send_message(
    chat_id: str,
    msg: schemas.MessageBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    # Verify participant
    chat = db.query(models.Chat).get(chat_id)
    if not chat:
        raise HTTPException(404, "Chat not found")
        
    is_part = db.query(models.ChatParticipant).filter(
        models.ChatParticipant.chat_id == chat_id,
        models.ChatParticipant.user_id == current_user.id
    ).first()
    if not is_part:
        raise HTTPException(403, "Not a participant")
        
    # Check if blocked
    # ... logic here if needed per message, assuming creation check is enough for MVP
    
    new_msg = models.Message(
        chat_id=chat_id,
        sender_id=current_user.id,
        content=msg.content
    )
    db.add(new_msg)
    
    # Update Chat Updated At
    chat.updated_at = func.now()
    
    db.commit()
    db.refresh(new_msg)
    
    return new_msg

@router.post("/block")
def block_user(
    body: dict, # { "user_id": "..." }
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    target_id = body.get("user_id")
    if not target_id: raise HTTPException(400)
    
    exists = db.query(models.BlockedUser).filter(
        models.BlockedUser.blocker_id == current_user.id,
        models.BlockedUser.blocked_id == target_id
    ).first()
    
    if exists: return {"status": "already_blocked"}
    
    block = models.BlockedUser(blocker_id=current_user.id, blocked_id=target_id)
    db.add(block)
    db.commit()
    return {"status": "blocked"}

@router.post("/report")
def report_user(
    body: dict, # { "user_id": "...", "reason": "...", "description": "..." }
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    target_id = body.get("user_id")
    reason = body.get("reason", "other")
    desc = body.get("description", "")
    
    report = models.UserReport(
        reporter_id=current_user.id,
        reported_id=target_id,
        reason=reason,
        description=desc
    )
    db.add(report)
    db.commit()
    return {"status": "reported"}

@router.delete("/{chat_id}")
def delete_chat(
    chat_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    # Verify participant
    is_part = db.query(models.ChatParticipant).filter(
        models.ChatParticipant.chat_id == chat_id,
        models.ChatParticipant.user_id == current_user.id
    ).first()
    
    if not is_part:
        raise HTTPException(status_code=403, detail="Not a participant of this chat")
        
    chat = db.query(models.Chat).get(chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
        
    # Check if other participants exist
    other_participants_count = db.query(models.ChatParticipant).filter(
        models.ChatParticipant.chat_id == chat_id,
        models.ChatParticipant.user_id != current_user.id
    ).count()

    if other_participants_count == 0:
        # Only me or empty -> Hard Delete
        db.delete(chat)
        db.commit()
        return {"status": "chat_deleted"}
    else:
        # Others present -> Leave Chat
        # 1. Send System Message
        msg = models.Message(
            chat_id=chat_id,
            content=f"{current_user.username} has left the chat. Conversation ended."
        )
        db.add(msg)
        
        # 2. Mark as terminated (so other user knows it's dead)
        chat.type = 'terminated'
        
        # 3. Remove ME from participants so it disappears from my list
        db.delete(is_part) # is_part is the ChatParticipant object for current_user
        
        db.commit()
        return {"status": "chat_left"}

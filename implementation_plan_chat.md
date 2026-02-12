# Chat System Implementation Plan

## Overview
We will implement a professional chat system with tiered access control, random matching, and direct messaging capabilities.

## Phase 1: Database & Backend Foundation
- [ ] **Database Schema**: Create tables for `chats`, `participants`, `messages`, `blocked_users`, `and user_reports`.
- [ ] **Models & Schemas**: Update FastAPI models and Pydantic schemas.
- [ ] **API Endpoints**:
    - `GET /chats`: List user's active conversations.
    - `GET /chats/{id}/messages`: Get message history.
    - `POST /chats/random`: Join queue / Create random chat (Pro+).
    - `POST /chats/direct`: Start chat with specific user (Enterprise+).
    - `POST /chats/{id}/messages`: Send a message.
    - `POST /users/block`: Block a user.
    - `POST /users/report`: Report a user.

## Phase 2: Frontend Core & Sidebar
- [ ] **Sidebar Update**: Add "Messages" tab (locked for Free users).
- [ ] **Chat Layout**: Create `app/dashboard/chat/page.tsx` with a responsive 2-column "WhatsApp-style" design.
- [ ] **Chat Components**: Build `ChatList`, `ChatWindow`, `MessageBubble`.

## Phase 3: Random Chat (Pro Feature)
- [ ] **Matchmaking Logic**: Backend logic to pair available users.
- [ ] **UI Integration**: "Find Random Partner" button in the chat sidebar.
- [ ] **Privacy**: Ensure only username is visible.

## Phase 4: Direct Messaging (Enterprise Feature)
- [ ] **Access Control**: Verify user is on the Enterprise/Plus plan.
- [ ] **Integration points**: Add "Message" icons to:
    - Question detailed view (Author).
    - Article detailed view (Author).
- [ ] **Safety UI**: Add "Block" and "Report" options in the chat header menu.

## Phase 5: Real-time & Polish
- [ ] **Polling/Updates**: Implement auto-refresh for new messages.
- [ ] **UX Polish**: Scroll-to-bottom, loading states, error handling.
- [ ] **Notifications**: Visual indicator for unread messages.

---

## SQL Commands (Run these in your SQL tool)

```sql
-- Create Chats Table
CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'direct' or 'random'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Chat Participants Table
CREATE TABLE IF NOT EXISTS chat_participants (
    id TEXT PRIMARY KEY,
    chat_id TEXT REFERENCES chats(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chat_id, user_id)
);

-- Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT REFERENCES chats(id) ON DELETE CASCADE,
    sender_id TEXT REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Blocked Users Table
CREATE TABLE IF NOT EXISTS blocked_users (
    id TEXT PRIMARY KEY,
    blocker_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    blocked_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);

-- Create User Reports Table
CREATE TABLE IF NOT EXISTS user_reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT REFERENCES users(id),
    reported_id TEXT REFERENCES users(id),
    reason TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

# Chat Communication Module Setup

## Overview

The chat communication module provides real-time messaging capabilities for the CRM system, allowing agents to communicate with prospects and clients across multiple social media platforms.

## Features

### ✅ Implemented Features

1. **Three-Panel Layout**
   - Left panel: Conversation list with prospect cards
   - Center panel: Message area with bot toggle
   - Right panel: Client information with accordion sections

2. **Multi-Platform Support**
   - WhatsApp
   - Instagram
   - Facebook
   - Telegram
   - Email
   - SMS

3. **Real-Time Messaging**
   - Socket.io integration ready
   - Message status indicators (sent, delivered, read)
   - Typing indicators
   - File and media support

4. **Client Management**
   - Prospect to client conversion
   - Client data management
   - Notes system
   - Quotes tracking

5. **Bot Integration**
   - Toggle bot assistance on/off
   - Bot message indicators

6. **URL Routing**
   - Direct conversation links
   - Shareable conversation URLs

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Configure your Socket.io server URL in `.env`:
```env
VITE_SOCKET_URL=ws://your-socket-server:3001
```

### 2. Socket.io Server Requirements

Your Socket.io server should handle these events:

#### Client Events (Frontend → Backend)
- `load_conversations` - Load user's conversations
- `load_prospects` - Load prospects list
- `load_clients` - Load clients list
- `load_messages` - Load messages for a conversation
- `send_message` - Send a new message
- `mark_as_read` - Mark conversation as read
- `convert_prospect` - Convert prospect to client
- `add_client_note` - Add note to client
- `update_chat_settings` - Update chat settings

#### Server Events (Backend → Frontend)
- `new_message` - New message received
- `conversation_updated` - Conversation data updated
- `prospect_updated` - Prospect data updated
- `typing` - Typing indicator

### 3. Data Models

The system expects these data structures:

#### ChatMessage
```typescript
interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderType: 'prospect' | 'agent' | 'bot'
  content: string
  messageType: 'text' | 'image' | 'file' | 'audio'
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'email' | 'sms'
  timestamp: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  metadata?: {
    fileName?: string
    fileSize?: number
    fileType?: string
    imageUrl?: string
    audioUrl?: string
  }
}
```

#### Conversation
```typescript
interface Conversation {
  id: string
  prospectId: string
  clientId?: string
  platform: string
  status: 'active' | 'closed' | 'archived'
  lastMessage?: ChatMessage
  lastActivity: string
  unreadCount: number
  assignedTo?: string
  tags: string[]
  isClientConverted: boolean
  createdAt: string
  updatedAt: string
}
```

#### Prospect
```typescript
interface Prospect {
  id: string
  identifier: string // phone, email, or social handle
  identifierType: 'phone' | 'email' | 'social'
  name?: string
  avatar?: string
  platform: string
  isClient: boolean
  clientId?: string
  lastSeen?: string
  createdAt: string
  updatedAt: string
}
```

#### Client
```typescript
interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company?: string
  avatar?: string
  status: 'active' | 'inactive'
  tags: string[]
  notes: ClientNote[]
  quotes: ClientQuote[]
  totalValue: number
  createdAt: string
  updatedAt: string
}
```

## Usage

### Accessing the Chat Module

Navigate to `/chat` to access the main chat interface, or `/chat/:conversationId` to open a specific conversation directly.

### Key Components

1. **ConversationsList** - Left panel showing all conversations
2. **ChatMessages** - Center panel for messaging
3. **ClientPanel** - Right panel with client information
4. **MessageBubble** - Individual message component

### State Management

The chat functionality uses Pinia store (`useChatStore`) for state management:

```typescript
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

// Connect to socket
chatStore.connectSocket({
  url: 'ws://localhost:3001',
  options: { transports: ['websocket'] }
})

// Send message
await chatStore.sendMessage(conversationId, 'Hello!')

// Convert prospect to client
await chatStore.convertProspectToClient(prospectId, clientData)
```

## Integration Checklist

- [ ] Set up Socket.io server with required events
- [ ] Configure environment variables
- [ ] Implement backend API endpoints
- [ ] Set up database models
- [ ] Configure social media platform integrations
- [ ] Test real-time messaging
- [ ] Set up file upload handling
- [ ] Configure push notifications

## Security Considerations

1. **Authentication**: Ensure proper user authentication for chat access
2. **Authorization**: Verify users can only access their assigned conversations
3. **Data Validation**: Validate all incoming messages and data
4. **Rate Limiting**: Implement rate limiting for message sending
5. **File Security**: Secure file upload and storage
6. **CORS**: Configure proper CORS settings for Socket.io

## Performance Optimization

1. **Message Pagination**: Implement pagination for message loading
2. **Connection Management**: Handle connection drops gracefully
3. **Memory Management**: Clean up old messages and data
4. **Caching**: Cache frequently accessed data
5. **Lazy Loading**: Load conversations and messages on demand

## Troubleshooting

### Common Issues

1. **Socket Connection Failed**
   - Check VITE_SOCKET_URL in .env file
   - Verify Socket.io server is running
   - Check network connectivity

2. **Messages Not Sending**
   - Verify socket connection status
   - Check server event handlers
   - Validate message data structure

3. **Authentication Issues**
   - Temporarily disabled for testing (see router/index.ts)
   - Re-enable authentication in production

## Next Steps

1. Implement Socket.io server backend
2. Set up social media platform APIs
3. Add file upload functionality
4. Implement push notifications
5. Add message search and filtering
6. Set up conversation archiving
7. Add bulk message operations
8. Implement conversation assignment
export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    online: boolean;
    lastSeen: string;
  };
  lastMessage: {
    text: string;
    time: string;
    unread: boolean;
  };
}
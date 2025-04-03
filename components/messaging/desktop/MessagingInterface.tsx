'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Send, Image, Smile, User, MessageSquare, MoreVertical } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSocket } from '@/hooks/useSocket';
import { useMessageStore } from '@/lib/store/messageStore';
import type { Message, Conversation } from '@/types/message';

export default function MessagingInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const socket = useSocket();
  const { messages, addMessage, setMessages, clearMessages } = useMessageStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();

    // Socket event listeners
    if (socket) {
      socket.on('receive_message', (message: Message) => {
        if (selectedConversation?.id === message.conversationId) {
          addMessage(message.conversationId, message);
        }
        updateConversationLastMessage(message);
      });

      socket.on('user_typing', (data) => {
        if (selectedConversation?.id === data.conversationId) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      socket.on('messages_read', (data) => {
        if (selectedConversation?.id === data.conversationId) {
          markMessagesAsRead(data.conversationId);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('messages_read');
      }
    };
  }, [socket, selectedConversation]);

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      initializeConversation(userId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedConversation?.id && selectedConversation.id !== 'new') {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const userData = getUserData();
      if (!userData?.id) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/messages/conversations?userId=${userData.id}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');

      const data = await response.json();
      setConversations(data.conversations);
      
      // If there's a conversationId in URL, select that conversation
      const conversationId = searchParams.get('conversationId');
      if (conversationId) {
        const conversation = data.conversations.find((c: Conversation) => c.id === conversationId);
        if (conversation) {
          setSelectedConversation(conversation);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setIsLoading(false);
    }
  };

  const initializeConversation = async (recipientId: string) => {
    try {
      const userData = getUserData();
      if (!userData?.id) {
        router.push('/auth/login');
        return;
      }

      // First check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.user.id === recipientId
      );

      if (existingConversation) {
        setSelectedConversation(existingConversation);
        return;
      }

      // If no existing conversation, get recipient info
      const response = await fetch('/api/messages/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          recipientId
        })
      });

      if (!response.ok) throw new Error('Failed to initialize conversation');

      const data = await response.json();
      
      // If there's an existing conversation in the response
      if (data.conversation) {
        const existingConversation: Conversation = {
          id: data.conversation.id,
          user: {
            id: data.recipient.id,
            name: data.recipient.name,
            avatar: data.recipient.avatar,
            online: data.recipient.online,
            lastSeen: data.recipient.lastSeen
          },
          lastMessage: {
            text: data.conversation.lastMessage?.content || 'Nouvelle conversation',
            time: data.conversation.lastMessage?.timestamp 
              ? format(new Date(data.conversation.lastMessage.timestamp), 'HH:mm', { locale: fr })
              : format(new Date(), 'HH:mm', { locale: fr }),
            unread: false
          }
        };
        setSelectedConversation(existingConversation);
        if (!conversations.some(conv => conv.id === existingConversation.id)) {
          setConversations(prev => [existingConversation, ...prev]);
        }
      } else {
        // Create new conversation object
        const newConversation: Conversation = {
          id: 'new',
          user: {
            id: recipientId,
            name: data.recipient.name,
            avatar: data.recipient.avatar,
            online: data.recipient.online,
            lastSeen: data.recipient.lastSeen
          },
          lastMessage: {
            text: 'Nouvelle conversation',
            time: format(new Date(), 'HH:mm', { locale: fr }),
            unread: false
          }
        };
        setSelectedConversation(newConversation);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      setMessages(conversationId, data.messages);

      // Mark messages as read
      if (socket && selectedConversation) {
        socket.emit('read_messages', {
          conversationId,
          userId: getUserData()?.id,
          recipientId: selectedConversation.user.id
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Update URL without reloading
    router.replace(`/messages?conversationId=${conversation.id}`, { scroll: false });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const userData = getUserData();
    if (!userData?.id) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`/api/messages/${selectedConversation.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          recipientId: selectedConversation.user.id,
          content: newMessage
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const message = await response.json();
      
      // If this was a new conversation, update the conversation ID
      if (selectedConversation.id === 'new') {
        const updatedConversation = {
          ...selectedConversation,
          id: message.conversationId
        };
        setSelectedConversation(updatedConversation);
        setConversations(prev => [updatedConversation, ...prev]);
        
        // Update URL with new conversation ID
        router.replace(`/messages?conversationId=${message.conversationId}`, { scroll: false });
      }

      // Add new message to the list
      addMessage(message.conversationId, message);
      
      // Update conversation's last message
      updateConversationLastMessage(message);

      // Emit message via socket
      if (socket) {
        socket.emit('send_message', {
          conversationId: message.conversationId,
          recipientId: selectedConversation.user.id,
          message
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedConversation) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Emit typing event
    socket.emit('typing', {
      conversationId: selectedConversation.id,
      userId: getUserData()?.id,
      recipientId: selectedConversation.user.id
    });

    // Set new timeout
    const timeout = setTimeout(() => {
      setTypingTimeout(null);
    }, 3000);
    setTypingTimeout(timeout);
  };

  const updateConversationLastMessage = (message: Message) => {
    setConversations(prev => prev.map(conv =>
      conv.id === message.conversationId ? {
        ...conv,
        lastMessage: {
          text: message.content,
          time: format(new Date(), 'HH:mm', { locale: fr }),
          unread: message.sender !== getUserData()?.id
        }
      } : conv
    ));
  };

  const markMessagesAsRead = (conversationId: string) => {
    setMessages(conversationId, 
      (messages[conversationId] || []).map(message => ({
        ...message,
        read: true
      }))
    );
  };

  return (
    <div className="flex-1 pt-[76px] p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex h-[calc(100vh-100px)] border border-gray-200">
        {/* Conversations List */}
        <div className="w-[320px] border-r border-gray-300 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-300 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition rounded-lg ${
                  selectedConversation?.id === conversation.id ? 'bg-gray-200' : ''
                }`}
              >
                {conversation.user.avatar ? (
                  <img
                    src={conversation.user.avatar}
                    alt={conversation.user.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-sm truncate text-gray-900">{conversation.user.name}</h3>
                    <span className="text-xs text-gray-500">{conversation.lastMessage.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-600 truncate">{conversation.lastMessage.text}</p>
                    {conversation.lastMessage.unread && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-300 bg-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {selectedConversation.user.avatar ? (
                    <img
                      src={selectedConversation.user.avatar}
                      alt={selectedConversation.user.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-medium text-gray-900">{selectedConversation.user.name}</h2>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.user.online ? 'En ligne' : selectedConversation.user.lastSeen}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                  <MoreVertical className="text-gray-500" size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100">
                {messages[selectedConversation.id]?.map((message) => {
                  const isOwnMessage = message.sender === getUserData()?.id;
                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-md ${isOwnMessage ? 'bg-primary text-white' : 'bg-white text-gray-900'}`}>
                        <p className="mb-1 text-sm">{message.content}</p>
                        <div className="flex items-center gap-1">
                          <p className={`text-[10px] ${isOwnMessage ? 'text-white/80' : 'text-gray-500'}`}>
                            {format(new Date(), 'HH:mm', { locale: fr })}
                          </p>
                          {isOwnMessage && message.read && (
                            <span className="text-[10px] text-white/80">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 px-4 py-2 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-300 bg-gray-100">
                <div className="flex items-center gap-2">
                  <button type="button" className="p-2 hover:bg-gray-200 rounded-lg transition">
                    <Image className="text-gray-400" size={20} />
                  </button>
                  <button type="button" className="p-2 hover:bg-gray-200 rounded-lg transition">
                    <Smile className="text-gray-400" size={20} />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition"
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()} 
                    className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition disabled:bg-gray-300"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-100">
              <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Sélectionnez une conversation pour commencer à discuter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Send, Image, Smile, User, MessageSquare, ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Conversation {
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

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
}

export default function MessagingInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      initializeConversation(userId);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const userData = getUserData();
      if (!userData?.id) return;

      const response = await fetch(`/api/messages/conversations?userId=${userData.id}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');

      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const initializeConversation = async (userId: string) => {
    try {
      const response = await fetch('/api/messages/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) throw new Error('Failed to initialize conversation');

      const data = await response.json();
      if (data.conversation) {
        setSelectedConversation({
          id: data.conversation.id,
          user: {
            id: data.recipient.id,
            name: data.recipient.name,
            avatar: data.recipient.avatar,
            online: data.recipient.online,
            lastSeen: data.recipient.lastSeen
          },
          lastMessage: data.conversation.lastMessage || {
            text: 'Nouvelle conversation',
            time: new Date().toISOString(),
            unread: false
          }
        });
        setShowConversationList(false);
      } else {
        setSelectedConversation({
          id: 'new',
          user: {
            id: data.recipient.id,
            name: data.recipient.name,
            avatar: data.recipient.avatar,
            online: data.recipient.online,
            lastSeen: data.recipient.lastSeen
          },
          lastMessage: {
            text: 'Nouvelle conversation',
            time: new Date().toISOString(),
            unread: false
          }
        });
        setShowConversationList(false);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const userData = getUserData();
      if (!userData?.id) return;

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
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleBack = () => {
    if (showConversationList) {
      router.back();
    } else {
      setShowConversationList(true);
      setSelectedConversation(null);
      setMessages([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {showConversationList ? (
        // Conversations List View
        <>
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <div className="flex items-center h-14 px-4">
              <button 
                onClick={() => router.back()}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-lg font-semibold ml-2">Messages</h1>
            </div>
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une conversation..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare size={48} className="mb-4" />
                <p>Aucune conversation</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setShowConversationList(false);
                  }}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {conversation.user.avatar ? (
                      <img
                        src={conversation.user.avatar}
                        alt={conversation.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">{conversation.user.name}</h3>
                        <span className="text-xs text-gray-500 ml-2">
                          {conversation.lastMessage.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        // Chat View
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          {selectedConversation && (
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
              <div className="flex items-center h-14 px-4">
                <button 
                  onClick={handleBack}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-3 ml-2">
                  {selectedConversation.user.avatar ? (
                    <img
                      src={selectedConversation.user.avatar}
                      alt={selectedConversation.user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-medium text-sm">
                      {selectedConversation.user.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.user.online ? 'En ligne' : selectedConversation.user.lastSeen}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="space-y-4">
              {messages.map((message) => {
                const userData = getUserData();
                const isOwnMessage = message.sender === userData?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-900 shadow-sm'
                      }`}
                    >
                      <p className="mb-1 text-sm">{message.text}</p>
                      <p className={`text-[10px] ${isOwnMessage ? 'text-white/80' : 'text-gray-500'}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Image className="text-gray-400" size={20} />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Smile className="text-gray-400" size={20} />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-colors"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors disabled:bg-gray-200"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
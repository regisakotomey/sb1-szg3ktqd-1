'use client';

import { useState } from 'react';
import { 
  Bell, Heart, MessageSquare, UserPlus, Store, 
  Calendar, MapPin, Briefcase, ShoppingBag 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

// Données de test pour les notifications
const initialNotifications = [
  {
    id: 1,
    type: 'like',
    user: {
      name: 'Marie Laurent',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
    },
    content: 'a aimé votre publication',
    target: 'Photo de profil',
    time: 'Il y a 5 minutes',
    read: false,
    link: '/profile/1'
  },
  {
    id: 2,
    type: 'follow',
    user: {
      name: 'Thomas Martin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100'
    },
    content: 'a commencé à vous suivre',
    time: 'Il y a 30 minutes',
    read: false,
    link: '/profile/2'
  },
  {
    id: 3,
    type: 'message',
    user: {
      name: 'Sophie Bernard',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100'
    },
    content: 'vous a envoyé un message',
    preview: 'Bonjour, je suis intéressée par...',
    time: 'Il y a 1 heure',
    read: true,
    link: '/messages/3'
  },
  {
    id: 4,
    type: 'event',
    user: {
      name: 'Festival de Musique',
      avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=100'
    },
    content: 'Un événement que vous suivez commence bientôt',
    time: 'Il y a 2 heures',
    read: true,
    link: '/events/4'
  },
  {
    id: 5,
    type: 'place',
    user: {
      name: 'Le Café Parisien',
      avatar: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=100'
    },
    content: 'a publié une nouvelle offre',
    time: 'Il y a 3 heures',
    read: true,
    link: '/places/5'
  },
  {
    id: 6,
    type: 'opportunity',
    user: {
      name: 'Tech Solutions',
      avatar: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=100'
    },
    content: 'Une nouvelle opportunité correspond à votre profil',
    time: 'Il y a 4 heures',
    read: true,
    link: '/opportunities/6'
  },
  {
    id: 7,
    type: 'shop',
    user: {
      name: 'Mode Élégante',
      avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=100'
    },
    content: 'a ajouté de nouveaux articles',
    time: 'Il y a 5 heures',
    read: true,
    link: '/shops/7'
  },
  {
    id: 8,
    type: 'product',
    user: {
      name: 'Tech Store',
      avatar: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=100'
    },
    content: 'Un produit de votre liste de souhaits est en promotion',
    time: 'Il y a 6 heures',
    read: true,
    link: '/marketplace/8'
  }
];

export default function NotificationsList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={20} />;
      case 'follow':
        return <UserPlus size={20} />;
      case 'message':
        return <MessageSquare size={20} />;
      case 'event':
        return <Calendar size={20} />;
      case 'place':
        return <MapPin size={20} />;
      case 'opportunity':
        return <Briefcase size={20} />;
      case 'shop':
        return <Store size={20} />;
      case 'product':
        return <ShoppingBag size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    router.push(notification.link);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        paddingTop: '76px',
        marginLeft: '250px',
        padding: '1rem',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            color: '#1a1a1a'
          }}>
            Notifications
          </h1>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  padding: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: notification.read ? 'transparent' : '#f8f9fa',
                  borderBottom: '1px solid #e0e0e0',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{
                  position: 'relative'
                }}>
                  <img
                    src={notification.user.avatar}
                    alt={notification.user.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {getIcon(notification.type)}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.95rem',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ fontWeight: 500 }}>{notification.user.name}</span>
                    {' '}
                    {notification.content}
                    {notification.target && (
                      <span style={{ color: '#666' }}> : {notification.target}</span>
                    )}
                  </div>
                  {notification.preview && (
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      marginBottom: '0.25rem'
                    }}>
                      {notification.preview}
                    </div>
                  )}
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#666'
                  }}>
                    {notification.time}
                  </div>
                </div>
                {!notification.read && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#1a1a1a',
                    flexShrink: 0
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
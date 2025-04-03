'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { 
  FcLike,
  FcAddressBook,
  FcFeedback,
  FcCalendar,
  FcGlobe,
  FcBriefcase,
  FcShop,
  FcShipped,
  FcBullish,
  FcBusinessman,
  FcHighPriority,
  FcInfo
} from 'react-icons/fc';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: string;
  actorId: string;
  contentType: 'event' | 'place' | 'opportunity' | 'shop' | 'product' | 'post' | 'user';
  contentId: string;
  contentTitle: string;
  reason: 'new_content' | 'content_updated' | 'content_deleted' | 'content_followed' | 'content_liked' | 'content_commented';
  imageUrl?: string;
  link: string;
  read: boolean;
  createdAt: string;
  actor: {
    name: string;
    avatar: string | null;
  };
}

export default function NotificationsList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userData = getUserData();
      if (!userData?.id) {
        router.push('/auth/mobile/login');
        return;
      }

      setLoading(true);
      setError(null);

      const response = await fetch(`/api/notifications/get?userId=${userData.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: Notification['contentType'], reason: Notification['reason']) => {
    // Si la raison est un like, toujours montrer l'icône de like
    if (reason === 'content_liked') return <FcLike size={16} />;
    
    // Si la raison est un follow, toujours montrer l'icône de follow
    if (reason === 'content_followed') return <FcAddressBook size={16} />;
    
    // Si la raison est un commentaire, toujours montrer l'icône de commentaire
    if (reason === 'content_commented') return <FcFeedback size={16} />;
    
    // Pour les autres raisons, montrer l'icône selon le type de contenu
    switch (type) {
      case 'event':
        return <FcCalendar size={16} />;
      case 'place':
        return <FcGlobe size={16} />;
      case 'opportunity':
        return <FcBriefcase size={16} />;
      case 'shop':
        return <FcShop size={16} />;
      case 'product':
        return <FcShipped size={16} />;
      case 'user':
        return <FcBusinessman size={16} />;
      default:
        return <FcInfo size={16} />;
    }
  };

  const getNotificationMessage = (notification: Notification): JSX.Element => {
    const actorName = notification.actor.name;

    switch (notification.reason) {
      case 'new_content':
        switch (notification.contentType) {
          case 'event':
            return (
              <>
                <b>{actorName}</b> a créé un nouvel événement :<br />
                <b>{notification.contentTitle}</b>
              </>
            );
          case 'place':
            return (
              <>
                <b>{actorName}</b> a ajouté un nouveau lieu :<br />
                <b>{notification.contentTitle}</b>
              </>
            );
          case 'opportunity':
            return (
              <>
                <b>{actorName}</b> a créé une nouvelle opportunité :<br />
                <b>{notification.contentTitle}</b>
              </>
            );
          case 'shop':
            return (
              <>
                <b>{actorName}</b> a créé une nouvelle boutique :<br />
                <b>{notification.contentTitle}</b>
              </>
            );
          case 'product':
            return (
              <>
                <b>{actorName}</b> a ajouté un nouveau produit :<br />
                <b>{notification.contentTitle}</b>
              </>
            );
          case 'post':
            return (
              <>
                <b>{actorName}</b> a publié un nouveau post :<br />
                <b>{notification.contentTitle}</b>
              </>
            );
          default:
            return (
              <>
                <b>{actorName}</b> a ajouté un nouveau contenu :<br />
                <b>{notification.contentTitle}</b>
              </>
            );
        }
      case 'content_updated':
        return (
          <>
            <b>{actorName}</b> a mis à jour {getContentTypeName(notification.contentType)} :<br />
            <b>{notification.contentTitle}</b>
          </>
        );
      case 'content_deleted':
        return (
          <>
            <b>{actorName}</b> a supprimé {getContentTypeName(notification.contentType)} :<br />
            <b>{notification.contentTitle}</b>
          </>
        );
      case 'content_followed':
        return (
          <>
            <b>{actorName}</b> a commencé à suivre {getContentTypeName(notification.contentType)} :<br />
            <b>{notification.contentTitle}</b>
          </>
        );
      case 'content_liked':
        return (
          <>
            <b>{actorName}</b> a aimé {getContentTypeName(notification.contentType)} :<br />
            <b>{notification.contentTitle}</b>
          </>
        );
      case 'content_commented':
        return (
          <>
            <b>{actorName}</b> a commenté {getContentTypeName(notification.contentType)} :<br />
            <b>{notification.contentTitle}</b>
          </>
        );
      default:
        return (
          <>
            <b>{actorName}</b> a interagi avec {getContentTypeName(notification.contentType)} :<br />
            <b>{notification.contentTitle}</b>
          </>
        );
    }
  };

  const getContentTypeName = (type: Notification['contentType']): string => {
    switch (type) {
      case 'event':
        return 'l\'événement';
      case 'place':
        return 'le lieu';
      case 'opportunity':
        return 'l\'opportunité';
      case 'shop':
        return 'la boutique';
      case 'product':
        return 'le produit';
      case 'post':
        return 'la publication';
      case 'user':
        return 'le profil';
      default:
        return 'le contenu';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      const userData = getUserData();
      if (!userData?.id) return;

      // Mark notification as read
      const response = await fetch(`/api/notifications/${notification.id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id })
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );

      // Navigate to the notification target
      router.push(notification.link);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleRetry = () => {
    fetchNotifications();
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center h-14 px-4">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold ml-2">Notifications</h1>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center h-14 px-4">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold ml-2">Notifications</h1>
          </div>
        </div>
        <div className="p-4">
          <div className="bg-white rounded-lg p-8 text-center">
            <FcHighPriority size={48} className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-500 mb-4">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center h-14 px-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold ml-2">Notifications</h1>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <FcInfo size={48} className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune notification
            </h3>
            <p className="text-gray-500">
              Vous n'avez pas encore reçu de notifications.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                notification.read ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              {notification.imageUrl && (
                <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={notification.imageUrl}
                    alt="Contenu de la notification"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm">
                      {getNotificationMessage(notification)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(notification.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
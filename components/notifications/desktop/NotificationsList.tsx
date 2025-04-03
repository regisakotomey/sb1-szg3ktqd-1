'use client';

import { useState, useEffect } from 'react';
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
        router.push('/auth/desktop/login');
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
    if (reason === 'content_liked') return <FcLike size={20} />;
    
    // Si la raison est un follow, toujours montrer l'icône de follow
    if (reason === 'content_followed') return <FcAddressBook size={20} />;
    
    // Si la raison est un commentaire, toujours montrer l'icône de commentaire
    if (reason === 'content_commented') return <FcFeedback size={20} />;
    
    // Pour les autres raisons, montrer l'icône selon le type de contenu
    switch (type) {
      case 'event':
        return <FcCalendar size={20} />;
      case 'place':
        return <FcGlobe size={20} />;
      case 'opportunity':
        return <FcBriefcase size={20} />;
      case 'shop':
        return <FcShop size={20} />;
      case 'product':
        return <FcShipped size={20} />;
      case 'user':
        return <FcBusinessman size={20} />;
      default:
        return <FcInfo size={20} />;
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
      <main className="flex-1 pt-[76px] mx-auto w-full max-w-[700px] transition-all">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Notifications
          </h1>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 pt-[76px] mx-auto w-full max-w-[700px] transition-all">
        <div className="p-4">
          <div className="bg-white rounded-xl p-8 text-center">
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
      </main>
    );
  }

  return (
    <main className="flex-1 pt-[76px] mx-auto w-full max-w-[700px] transition-all">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Notifications
        </h1>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                className={`flex items-center gap-4 p-4 cursor-pointer transition-colors border border-gray-200 rounded-lg shadow-sm hover:shadow-md ${
                  notification.read ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {notification.imageUrl && (
                  <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={notification.imageUrl}
                      alt="Contenu de la notification"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getNotificationMessage(notification)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notification.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>

                    {!notification.read && (
                      <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

            ))
          )}
        </div>
      </div>
    </main>
  );
}
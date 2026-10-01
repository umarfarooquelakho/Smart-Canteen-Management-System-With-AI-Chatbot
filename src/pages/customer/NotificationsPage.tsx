import { Bell, Check, CheckCheck } from 'lucide-react';
import { notificationsDB } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { timeAgo } from '../../utils/format';
import EmptyState from '../../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

const TYPE_ICONS: Record<string, string> = {
  order_accepted: '✅',
  order_preparing: '👨‍🍳',
  order_ready: '🔔',
  order_delayed: '⚠️',
  order_cancelled: '❌',
  order_rejected: '🚫',
  pickup_reminder: '⏰',
  system: 'ℹ️',
};

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const notifVersion = useAppStore((s) => s.notifVersion);
  const { refreshNotifs } = useAppStore();
  const navigate = useNavigate();

  if (!user) return null;

  const notifications = notificationsDB.getByUser(user.id);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = () => {
    notificationsDB.markAllRead(user.id);
    refreshNotifs();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="section-title">Notifications</h1>
          {unreadCount > 0 && <p className="section-subtitle">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-1.5">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-12 w-12 text-charcoal-300" />}
          title="No notifications yet"
          description="You'll see order updates and alerts here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => {
                if (!notif.is_read) {
                  notificationsDB.markRead(notif.id);
                  refreshNotifs();
                }
                if (notif.order_id) navigate(`/track/${notif.order_id}`);
              }}
              className={clsx(
                'w-full text-left card transition-all hover:shadow-card-hover',
                !notif.is_read && 'border-l-4 border-l-primary bg-primary/5'
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 mt-0.5">{TYPE_ICONS[notif.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-charcoal text-sm">{notif.title}</div>
                    {!notif.is_read && (
                      <span className="shrink-0 h-2 w-2 bg-primary rounded-full mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-charcoal-500 mt-0.5 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-charcoal-400">
                    <span>{timeAgo(notif.created_at)}</span>
                    {notif.is_read && <span className="flex items-center gap-0.5"><Check className="h-3 w-3" /> Read</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

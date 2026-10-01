import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Bell, ArrowRight, Clock, Star } from 'lucide-react';
import { ordersDB, notificationsDB } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { formatPrice, formatTime, timeAgo } from '../../utils/format';
import { OrderStatusBadge } from '../../components/ui/StatusBadge';
import { getFoodRecommendations } from '../../services/analyticsService';

export default function CustomerDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const ordersVersion = useAppStore((s) => s.ordersVersion);
  const notifVersion = useAppStore((s) => s.notifVersion);

  if (!user) return null;

  const myOrders = ordersDB.getByCustomer(user.id);
  const activeOrders = myOrders.filter((o) =>
    ['placed', 'accepted', 'preparing', 'ready', 'delayed'].includes(o.order_status)
  );
  const recentOrders = myOrders.slice(0, 3);
  const notifications = notificationsDB.getByUser(user.id).slice(0, 3);
  const recs = getFoodRecommendations(user.id, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Hello, {user.name.split(' ')[0]}! 👋</h1>
        <p className="text-charcoal-400 text-sm mt-1">Here's what's happening with your orders.</p>
      </div>

      {/* Active orders */}
      {activeOrders.length > 0 ? (
        <section>
          <h2 className="font-semibold text-charcoal mb-3">Active Orders ({activeOrders.length})</h2>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/track/${order.id}`)}
                className="w-full card-hover text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-black text-primary">{order.token_number}</div>
                    <div>
                      <OrderStatusBadge status={order.order_status} showDot />
                      <div className="text-xs text-charcoal-400 mt-0.5">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items · {formatPrice(order.total_amount)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {order.estimated_ready_time && (
                      <div className="flex items-center gap-1 text-xs text-charcoal-500">
                        <Clock className="h-3 w-3" />
                        Ready at {formatTime(order.estimated_ready_time)}
                      </div>
                    )}
                    <ArrowRight className="h-4 w-4 text-charcoal-300 ml-auto mt-1" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <div className="card text-center bg-beige-50 border-dashed border-2">
          <ShoppingBag className="h-10 w-10 text-charcoal-200 mx-auto mb-2" />
          <p className="text-charcoal-400 text-sm mb-3">No active orders right now</p>
          <button onClick={() => navigate('/menu')} className="btn-primary btn-sm">
            Order Food
          </button>
        </div>
      )}

      {/* Recent notifications */}
      {notifications.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-charcoal">Recent Notifications</h2>
            <button onClick={() => navigate('/notifications')} className="text-xs text-primary font-medium">View all</button>
          </div>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className={`card py-3 ${!n.is_read ? 'border-l-4 border-l-primary' : ''}`}>
                <div className="font-medium text-charcoal text-sm">{n.title}</div>
                <div className="text-xs text-charcoal-400 mt-0.5">{n.message}</div>
                <div className="text-xs text-charcoal-300 mt-1">{timeAgo(n.created_at)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-charcoal">Recommended for You</h2>
            <button onClick={() => navigate('/menu')} className="text-xs text-primary font-medium">See menu</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {recs.map(({ menu_item: item, reason }) => (
              <button
                key={item.id}
                onClick={() => navigate('/menu')}
                className="card-hover p-3 text-left overflow-hidden"
              >
                <img
                  src={item.image_url} alt={item.name}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'; }}
                />
                <div className="font-medium text-charcoal text-xs truncate">{item.name}</div>
                <div className="text-primary font-bold text-sm">{formatPrice(item.price)}</div>
                <div className="text-xs text-charcoal-400 mt-0.5 truncate">{reason}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-charcoal">Recent Orders</h2>
            <button onClick={() => navigate('/orders')} className="text-xs text-primary font-medium">View all</button>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/track/${order.id}`)}
                className="w-full card-hover text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-primary">{order.token_number}</span>
                    <span className="text-xs text-charcoal-400 ml-2">
                      {order.items.map((i) => i.menu_item?.name ?? 'Item').join(', ').slice(0, 40)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <OrderStatusBadge status={order.order_status} />
                    <span className="text-sm font-semibold">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

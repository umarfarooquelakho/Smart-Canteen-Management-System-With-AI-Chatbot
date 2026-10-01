import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, RotateCcw, Eye, Package } from 'lucide-react';
import { ordersDB, menuDB } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useAppStore } from '../../store/appStore';
import { formatPrice, formatDateTime } from '../../utils/format';
import { OrderStatusBadge } from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import type { OrderStatus } from '../../types';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const TABS: { key: string; label: string; statuses?: OrderStatus[] }[] = [
  { key: 'all',     label: 'All Orders' },
  { key: 'active',  label: 'Active',    statuses: ['placed', 'accepted', 'preparing', 'ready', 'delayed'] },
  { key: 'done',    label: 'Completed', statuses: ['completed', 'collected'] },
  { key: 'other',   label: 'Cancelled', statuses: ['cancelled', 'rejected', 'not_collected'] },
];

export default function OrderHistoryPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const ordersVersion = useAppStore((s) => s.ordersVersion);
  const { addItem, clearCart } = useCartStore();
  const [activeTab, setActiveTab] = useState('all');

  if (!user) return null;

  const allOrders = ordersDB.getByCustomer(user.id);
  const tab = TABS.find((t) => t.key === activeTab)!;
  const filtered = tab.statuses
    ? allOrders.filter((o) => tab.statuses!.includes(o.order_status))
    : allOrders;

  const handleReorder = (orderId: string) => {
    const order = ordersDB.getById(orderId);
    if (!order) return;
    let addedCount = 0;
    const unavailable: string[] = [];

    order.items.forEach((oi) => {
      const item = menuDB.getById(oi.item_id);
      if (item && item.status !== 'sold_out' && item.available_quantity > 0) {
        addItem(item, Math.min(oi.quantity, item.available_quantity));
        addedCount++;
      } else {
        unavailable.push(item?.name ?? 'Unknown item');
      }
    });

    if (addedCount > 0) toast.success(`${addedCount} item${addedCount !== 1 ? 's' : ''} added to cart`);
    if (unavailable.length > 0) toast.error(`Unavailable: ${unavailable.join(', ')}`);
    if (addedCount > 0) navigate('/cart');
  };

  return (
    <div>
      <h1 className="section-title mb-5">My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 mb-5 border overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={clsx('flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
              activeTab === t.key ? 'bg-primary text-white' : 'text-charcoal-500 hover:bg-beige'
            )}
          >
            {t.label}
            <span className={clsx('ml-1.5 text-xs rounded-full px-1.5 py-0.5',
              activeTab === t.key ? 'bg-white/20 text-white' : 'bg-charcoal-100 text-charcoal-500'
            )}>
              {t.statuses ? allOrders.filter((o) => t.statuses!.includes(o.order_status)).length : allOrders.length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12 text-charcoal-300" />}
          title="No orders found"
          description="Your order history will appear here."
          action={<button onClick={() => navigate('/menu')} className="btn-primary">Order Now</button>}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-2xl text-primary">{order.token_number}</span>
                    <OrderStatusBadge status={order.order_status} showDot />
                  </div>
                  <div className="text-xs text-charcoal-400 mt-0.5">
                    #{order.id.slice(-6).toUpperCase()} · {formatDateTime(order.created_at)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-charcoal">{formatPrice(order.total_amount)}</div>
                  <div className="text-xs text-charcoal-400">{order.items.reduce((s, i) => s + i.quantity, 0)} items</div>
                </div>
              </div>

              {/* Items */}
              <div className="text-sm text-charcoal-500 mb-3">
                {order.items.map((oi) => (
                  <span key={oi.id} className="mr-2">
                    {oi.menu_item?.name ?? `Item ${oi.item_id}`} ×{oi.quantity}
                  </span>
                ))}
              </div>

              {/* Pickup / timing */}
              {order.pickup_time && (
                <div className="flex items-center gap-1.5 text-xs text-charcoal-400 mb-3">
                  <Clock className="h-3 w-3" />
                  Pickup: {formatDateTime(order.pickup_time)}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                {['placed', 'accepted', 'preparing', 'ready', 'delayed'].includes(order.order_status) && (
                  <button
                    onClick={() => navigate(`/track/${order.id}`)}
                    className="btn-primary btn-sm flex-1"
                  >
                    <Eye className="h-3.5 w-3.5" /> Track
                  </button>
                )}
                <button
                  onClick={() => handleReorder(order.id)}
                  className="btn-outline btn-sm flex-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

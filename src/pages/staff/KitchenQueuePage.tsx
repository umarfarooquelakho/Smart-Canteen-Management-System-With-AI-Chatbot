import { useState } from 'react';
import { RefreshCw, AlertTriangle, Clock, User as UserIcon, ChefHat, CheckCircle, XCircle, Zap } from 'lucide-react';
import { ordersDB, queueDB, menuDB } from '../../lib/db';
import { updateOrderStatus } from '../../services/orderService';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { formatTime, timeAgo, minutesUntil } from '../../utils/format';
import { OrderStatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { getPriorityReason, isOrderDelayed } from '../../services/queueService';
import type { OrderStatus, QueueEntry } from '../../types';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type Tab = 'new' | 'accepted' | 'preparing' | 'ready' | 'delayed';

const TABS: { key: Tab; label: string; statuses: OrderStatus[] }[] = [
  { key: 'new',       label: 'New',       statuses: ['placed'] },
  { key: 'accepted',  label: 'Accepted',  statuses: ['accepted'] },
  { key: 'preparing', label: 'Preparing', statuses: ['preparing'] },
  { key: 'ready',     label: 'Ready',     statuses: ['ready'] },
  { key: 'delayed',   label: 'Delayed',   statuses: ['delayed'] },
];

export default function KitchenQueuePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { refreshOrders, refreshQueue } = useAppStore();
  useAppStore((s) => s.ordersVersion); // subscribe for reactivity
  useAppStore((s) => s.queueVersion);
  const [activeTab, setActiveTab] = useState<Tab>('new');

  const allActive = ordersDB.getActiveOrders();
  const queueEntries = queueDB.getAll();

  const getQueueEntry = (orderId: string): QueueEntry | undefined =>
    queueEntries.find((q) => q.order_id === orderId);

  const tabOrders = (tab: Tab) => {
    const statuses = TABS.find((t) => t.key === tab)!.statuses;
    return allActive
      .filter((o) => statuses.includes(o.order_status))
      .sort((a, b) => {
        const qa = getQueueEntry(a.id);
        const qb = getQueueEntry(b.id);
        return (qb?.priority_score ?? 0) - (qa?.priority_score ?? 0);
      });
  };

  const handleAction = (orderId: string, newStatus: OrderStatus) => {
    try {
      updateOrderStatus(orderId, newStatus, user ?? undefined);
      toast.success(`Order updated to ${newStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  // KPIs
  const kpis = [
    { label: 'New', value: tabOrders('new').length,       color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Preparing', value: tabOrders('preparing').length, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Ready', value: tabOrders('ready').length,     color: 'text-seagreen',  bg: 'bg-seagreen-50' },
    { label: 'Delayed', value: tabOrders('delayed').length,   color: 'text-primary',   bg: 'bg-primary/10' },
  ];

  const currentOrders = tabOrders(activeTab);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl p-4 ${bg}`}>
            <div className={`text-3xl font-black ${color}`}>{value}</div>
            <div className="text-sm text-charcoal-600 font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Queue size + refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-charcoal">Live Kitchen Queue</h1>
          <p className="text-charcoal-500 text-sm">{allActive.length} active orders</p>
        </div>
        <button
          onClick={() => { refreshOrders(); refreshQueue(); }}
          className="flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-primary transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-white border border-charcoal-200 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
        {TABS.map((tab) => {
          const count = tabOrders(tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer',
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-charcoal-600 hover:bg-beige hover:text-charcoal'
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-bold',
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-charcoal-100 text-charcoal-600'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Order cards */}
      {currentOrders.length === 0 ? (
        <div className="card text-center py-16 text-charcoal-400">
          <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No {activeTab} orders</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentOrders.map((order) => {
            const qEntry = getQueueEntry(order.id);
            const { delayed, minutesLate } = isOrderDelayed(order);
            const pickupMins = order.pickup_time ? minutesUntil(order.pickup_time) : null;
            const isUrgent = pickupMins !== null && pickupMins <= 10;

            return (
              <div
                key={order.id}
                className={clsx(
                  'card transition-all',
                  delayed ? 'border-primary/60 bg-primary/5' :
                  isUrgent ? 'border-amber-500/40 bg-amber-50/20' :
                  'border-charcoal-200'
                )}
              >
                {/* Token + priority */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl font-black text-primary">{order.token_number}</div>
                  <div className="flex flex-col items-end gap-1">
                    {qEntry && <PriorityBadge score={qEntry.priority_score} />}
                    <OrderStatusBadge status={order.order_status} />
                  </div>
                </div>

                {/* Delay warning */}
                {(delayed || order.order_status === 'delayed') && (
                  <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs px-2.5 py-1.5 rounded-lg mb-3 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {minutesLate > 0 ? `${minutesLate} min overdue` : 'Order delayed'}
                  </div>
                )}

                {/* Pickup urgency */}
                {isUrgent && !delayed && (
                  <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs px-2.5 py-1.5 rounded-lg mb-3 font-medium">
                    <Zap className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    Pickup in {pickupMins} min!
                  </div>
                )}

                {/* Priority reason */}
                {qEntry && (
                  <div className="text-xs text-charcoal-500 mb-3 flex items-start gap-1.5 bg-beige/60 p-2 rounded-lg">
                    <span>📊</span>
                    <span>{getPriorityReason(order, qEntry)}</span>
                  </div>
                )}

                {/* Order items */}
                <div className="mb-3 space-y-1 bg-charcoal-50/50 p-2.5 rounded-xl border border-charcoal-100">
                  {order.items.map((oi) => {
                    const menuItem = menuDB.getById(oi.item_id);
                    return (
                      <div key={oi.id} className="text-sm text-charcoal">
                        <span className="font-medium">{menuItem?.name ?? 'Item'}</span>
                        <span className="text-charcoal-500 font-semibold"> × {oi.quantity}</span>
                        {oi.special_instruction && (
                          <div className="text-xs text-amber-700 ml-2 font-medium">📝 {oi.special_instruction}</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-charcoal-400 mb-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {order.pickup_time ? formatTime(order.pickup_time) : 'ASAP'}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    {order.customer?.name ?? 'Customer'}
                  </span>
                  <span>{timeAgo(order.created_at)}</span>
                </div>

                {/* Estimated ready */}
                {order.estimated_ready_time && (
                  <div className="text-xs text-charcoal-500 mb-3">
                    ETA: <span className="text-charcoal font-semibold">{formatTime(order.estimated_ready_time)}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {order.order_status === 'placed' && (
                    <>
                      <button onClick={() => handleAction(order.id, 'accepted')} className="btn-secondary btn-sm flex-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Accept
                      </button>
                      <button onClick={() => handleAction(order.id, 'rejected')} className="btn-danger btn-sm">
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {order.order_status === 'accepted' && (
                    <button onClick={() => handleAction(order.id, 'preparing')} className="btn-primary btn-sm flex-1">
                      <ChefHat className="h-3.5 w-3.5" /> Start Preparing
                    </button>
                  )}
                  {order.order_status === 'preparing' && (
                    <>
                      <button onClick={() => handleAction(order.id, 'ready')} className="btn-secondary btn-sm flex-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Mark Ready
                      </button>
                      <button onClick={() => handleAction(order.id, 'delayed')} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-100 text-amber-700 font-medium rounded-lg hover:bg-amber-200 transition-colors">
                        <AlertTriangle className="h-3.5 w-3.5" /> Delay
                      </button>
                    </>
                  )}
                  {order.order_status === 'delayed' && (
                    <>
                      <button onClick={() => handleAction(order.id, 'ready')} className="btn-secondary btn-sm flex-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Mark Ready
                      </button>
                      <button onClick={() => handleAction(order.id, 'preparing')} className="btn-outline btn-sm flex-1">
                        Resume
                      </button>
                    </>
                  )}
                  {order.order_status === 'ready' && (
                    <button
                      onClick={() => navigate(`/staff/verify?token=${order.token_number}`)}
                      className="btn-primary btn-sm flex-1"
                    >
                      Verify Collection
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

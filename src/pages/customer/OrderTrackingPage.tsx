import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Clock, AlertTriangle, ArrowLeft, RefreshCw, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ordersDB, queueDB } from '../../lib/db';
import { cancelOrderByCustomer } from '../../services/orderService';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { formatPrice, formatTime, timeAgo } from '../../utils/format';
import { OrderStatusBadge } from '../../components/ui/StatusBadge';
import type { Order, QueueEntry } from '../../types';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const STATUS_STEPS = [
  { key: 'placed',     label: 'Order Placed',    icon: '📋' },
  { key: 'accepted',   label: 'Accepted',         icon: '✅' },
  { key: 'preparing',  label: 'Preparing',        icon: '👨‍🍳' },
  { key: 'ready',      label: 'Ready',            icon: '🔔' },
  { key: 'collected',  label: 'Collected',        icon: '📦' },
  { key: 'completed',  label: 'Completed',        icon: '🎉' },
];

const STATUS_ORDER = ['placed', 'accepted', 'preparing', 'ready', 'collected', 'completed'];

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const ordersVersion = useAppStore((s) => s.ordersVersion);

  const [order, setOrder] = useState<Order | null>(null);
  const [queue, setQueue] = useState<QueueEntry | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const loadOrder = () => {
    if (!orderId) return;
    const o = ordersDB.getById(orderId);
    setOrder(o ?? null);
    if (o) setQueue(queueDB.getByOrder(o.id) ?? null);
  };

  useEffect(() => { loadOrder(); }, [orderId, ordersVersion]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const t = setInterval(loadOrder, 5000);
    return () => clearInterval(t);
  }, [orderId]);

  const handleCancel = async () => {
    if (!order || !user) return;
    setCancelling(true);
    try {
      cancelOrderByCustomer(order.id, user);
      toast.success('Order cancelled.');
      loadOrder();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot cancel at this stage.');
    } finally {
      setCancelling(false);
    }
  };

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-charcoal-400">Order not found.</p>
        <button onClick={() => navigate('/orders')} className="btn-primary mt-4">My Orders</button>
      </div>
    );
  }

  const currentStepIdx = STATUS_ORDER.indexOf(order.order_status);
  const isTerminal = ['cancelled', 'rejected', 'not_collected', 'completed', 'collected'].includes(order.order_status);
  const canCancel = ['placed', 'accepted'].includes(order.order_status);
  const isDelayed = order.order_status === 'delayed';
  const qrData = JSON.stringify({ token: order.token_number, order_id: order.id });

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-6">
      {/* Back */}
      <button onClick={() => navigate('/orders')} className="flex items-center gap-1.5 text-sm text-charcoal-400 hover:text-charcoal">
        <ArrowLeft className="h-4 w-4" /> My Orders
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-charcoal-400 font-medium">ORDER #{order.id.slice(-6).toUpperCase()}</div>
            <div className="text-4xl font-black text-primary tracking-widest mt-0.5">{order.token_number}</div>
          </div>
          <div className="text-right">
            <OrderStatusBadge status={order.order_status} showDot />
            <div className="text-xs text-charcoal-400 mt-1">{timeAgo(order.created_at)}</div>
          </div>
        </div>

        {/* Queue position */}
        {queue && !isTerminal && (
          <div className="bg-beige rounded-xl p-3 text-sm flex items-center justify-between">
            <span className="text-charcoal-600">Queue Position</span>
            <span className="font-bold text-charcoal">#{queue.position}</span>
          </div>
        )}

        {/* Delayed warning */}
        {isDelayed && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-primary/10 border border-primary/30 rounded-xl text-sm text-primary">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Your order is taking longer than expected. We apologize for the delay. You'll be notified when it's ready.</span>
          </div>
        )}
      </div>

      {/* Progress timeline */}
      {!['cancelled', 'rejected', 'not_collected'].includes(order.order_status) && (
        <div className="card">
          <h2 className="font-semibold text-charcoal mb-5">Order Progress</h2>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-charcoal-100" />
            <div className="space-y-5">
              {STATUS_STEPS.map((step, idx) => {
                const done = currentStepIdx > idx || (isTerminal && !['cancelled', 'rejected'].includes(order.order_status));
                const active = currentStepIdx === idx;
                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <div className={clsx(
                      'relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all',
                      done ? 'bg-seagreen text-white' :
                      active ? 'bg-primary text-white scale-110 shadow-md' :
                      'bg-charcoal-100 text-charcoal-400'
                    )}>
                      {done ? <CheckCircle className="h-5 w-5" /> :
                       active ? <span className="text-lg">{step.icon}</span> :
                       <Circle className="h-4 w-4" />}
                    </div>
                    <div className={clsx('flex-1', active && 'font-semibold')}>
                      <div className={clsx('text-sm', done ? 'text-seagreen' : active ? 'text-charcoal' : 'text-charcoal-300')}>
                        {step.label}
                      </div>
                      {active && step.key === 'preparing' && order.estimated_ready_time && (
                        <div className="text-xs text-charcoal-400 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Est. ready: {formatTime(order.estimated_ready_time)}
                        </div>
                      )}
                      {active && step.key === 'ready' && (
                        <div className="text-xs text-seagreen font-medium mt-0.5">
                          🎉 Show your token at the counter!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cancelled/Rejected */}
      {['cancelled', 'rejected', 'not_collected'].includes(order.order_status) && (
        <div className="card bg-charcoal-50 border border-charcoal-200 text-center">
          <div className="text-4xl mb-2">😔</div>
          <h3 className="font-semibold text-charcoal capitalize">{order.order_status.replace('_', ' ')}</h3>
          <p className="text-sm text-charcoal-400 mt-1">
            {order.order_status === 'cancelled' ? 'This order was cancelled.' :
             order.order_status === 'rejected' ? 'This order was rejected by kitchen staff.' :
             'This order was not collected in time.'}
          </p>
        </div>
      )}

      {/* Timing row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
          <div className="text-xs text-charcoal-400 font-medium">ESTIMATED READY</div>
          <div className="text-lg font-bold text-charcoal">
            {order.estimated_ready_time ? formatTime(order.estimated_ready_time) : '—'}
          </div>
        </div>
        <div className="card text-center">
          <div className="text-xl mb-1">📍</div>
          <div className="text-xs text-charcoal-400 font-medium">PICKUP TIME</div>
          <div className="text-lg font-bold text-charcoal">
            {order.pickup_time ? formatTime(order.pickup_time) : 'ASAP'}
          </div>
        </div>
      </div>

      {/* Token & QR */}
      {order.order_status === 'ready' && (
        <div className="card text-center border-2 border-seagreen/40 bg-seagreen-50">
          <div className="text-lg font-bold text-seagreen mb-1">🔔 Your Order is Ready!</div>
          <p className="text-sm text-charcoal-400 mb-4">Show this QR code or token at the counter</p>
          <div className="text-6xl font-black text-primary mb-4">{order.token_number}</div>
          <div className="flex justify-center">
            <QRCodeSVG value={qrData} size={160} fgColor="#171717" bgColor="#ffffff" level="M" />
          </div>
        </div>
      )}

      {/* Show QR button */}
      {!['cancelled', 'rejected', 'not_collected'].includes(order.order_status) && order.order_status !== 'ready' && (
        <button onClick={() => setShowQR(true)} className="btn-outline w-full">
          Show QR Code / Token
        </button>
      )}

      {/* QR modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal/60" onClick={() => setShowQR(false)} />
          <div className="relative bg-white rounded-2xl p-8 text-center max-w-xs w-full animate-slide-up">
            <button onClick={() => setShowQR(false)} className="absolute top-3 right-3 btn-ghost p-1">
              <X className="h-4 w-4" />
            </button>
            <p className="text-xs text-charcoal-400 font-medium mb-2">DIGITAL TOKEN</p>
            <div className="text-6xl font-black text-primary mb-3">{order.token_number}</div>
            <div className="flex justify-center mb-3">
              <QRCodeSVG value={qrData} size={160} fgColor="#171717" bgColor="#ffffff" level="M" />
            </div>
            <div className="text-xs text-charcoal-400">Order #{order.id.slice(-6).toUpperCase()}</div>
          </div>
        </div>
      )}

      {/* Cancel button */}
      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="btn-ghost w-full text-red-500 hover:bg-red-50"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}

      {/* Refresh */}
      <button onClick={loadOrder} className="flex items-center gap-1.5 mx-auto text-sm text-charcoal-400 hover:text-charcoal">
        <RefreshCw className="h-3.5 w-3.5" /> Refresh status
      </button>
    </div>
  );
}


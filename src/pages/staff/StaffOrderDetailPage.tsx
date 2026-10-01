import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ordersDB } from '../../lib/db';
import { formatPrice, formatTime, formatDateTime } from '../../utils/format';
import { OrderStatusBadge } from '../../components/ui/StatusBadge';
import { updateOrderStatus } from '../../services/orderService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function StaffOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!orderId) return null;
  const order = ordersDB.getById(orderId);
  if (!order) return <div className="text-charcoal p-8">Order not found</div>;

  const handleStatus = (status: Parameters<typeof updateOrderStatus>[1]) => {
    try {
      updateOrderStatus(order.id, status, user ?? undefined);
      toast.success(`Updated to ${status}`);
      navigate(-1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-charcoal-500 hover:text-charcoal mb-4 cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-4xl font-black text-primary">{order.token_number}</div>
          <OrderStatusBadge status={order.order_status} />
        </div>

        <div className="space-y-3 mb-5">
          {order.items.map((oi) => (
            <div key={oi.id} className="flex justify-between text-sm text-charcoal">
              <div>
                <span className="font-medium">{oi.menu_item?.name}</span> × {oi.quantity}
                {oi.special_instruction && <div className="text-amber-700 text-xs font-medium">📝 {oi.special_instruction}</div>}
              </div>
              <span className="font-semibold">{formatPrice(oi.price * oi.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-charcoal border-t border-charcoal-200 pt-2">
            <span>Total</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-charcoal-500 mb-5 bg-charcoal-50/50 p-3 rounded-xl border border-charcoal-100">
          <div><span className="text-charcoal-400 font-medium">Order Time:</span> {formatDateTime(order.order_time)}</div>
          <div><span className="text-charcoal-400 font-medium">Pickup:</span> {order.pickup_time ? formatTime(order.pickup_time) : 'ASAP'}</div>
          <div><span className="text-charcoal-400 font-medium">Est. Ready:</span> {order.estimated_ready_time ? formatTime(order.estimated_ready_time) : '—'}</div>
          <div><span className="text-charcoal-400 font-medium">Customer:</span> {order.customer?.name ?? '—'}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {order.order_status === 'placed' && (
            <>
              <button onClick={() => handleStatus('accepted')} className="btn-secondary flex-1">Accept</button>
              <button onClick={() => handleStatus('rejected')} className="btn-danger">Reject</button>
            </>
          )}
          {order.order_status === 'accepted' && (
            <button onClick={() => handleStatus('preparing')} className="btn-primary flex-1">Start Preparing</button>
          )}
          {order.order_status === 'preparing' && (
            <>
              <button onClick={() => handleStatus('ready')} className="btn-secondary flex-1">Mark Ready</button>
              <button onClick={() => handleStatus('delayed')} className="btn-outline border-amber-500 text-amber-400 flex-1">Mark Delayed</button>
            </>
          )}
          {order.order_status === 'ready' && (
            <button onClick={() => navigate(`/staff/verify?token=${order.token_number}`)} className="btn-primary flex-1">
              Verify Collection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, ArrowRight, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ordersDB } from '../../lib/db';
import { formatPrice, formatTime } from '../../utils/format';
import { OrderStatusBadge } from '../../components/ui/StatusBadge';
import { useEffect, useState } from 'react';
import type { Order } from '../../types';

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      const found = ordersDB.getById(orderId);
      setOrder(found ?? null);
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-charcoal-400">Order not found.</p>
        <button onClick={() => navigate('/orders')} className="btn-primary mt-4">My Orders</button>
      </div>
    );
  }

  const qrData = JSON.stringify({ token: order.token_number, order_id: order.id });

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-6">
      {/* Success header */}
      <div className="card text-center bg-seagreen-50 border border-seagreen-200">
        <CheckCircle className="h-16 w-16 text-seagreen mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-charcoal">Order Confirmed!</h1>
        <p className="text-charcoal-400 mt-1">Your order has been placed successfully</p>
        <OrderStatusBadge status={order.order_status} className="mt-2" />
      </div>

      {/* Token */}
      <div className="card text-center border-2 border-primary/20">
        <p className="text-sm text-charcoal-400 font-medium mb-2">YOUR DIGITAL TOKEN</p>
        <div className="text-7xl font-black text-primary tracking-widest mb-1">{order.token_number}</div>
        <p className="text-xs text-charcoal-400">Show this token or QR code at the collection counter</p>

        {/* QR Code */}
        <div className="flex justify-center mt-4 p-4 bg-white rounded-xl border inline-block mx-auto">
          <QRCodeSVG
            value={qrData}
            size={140}
            fgColor="#171717"
            bgColor="#ffffff"
            level="M"
          />
        </div>
        <p className="text-xs text-charcoal-300 mt-2">Scan to verify order</p>
      </div>

      {/* Order details */}
      <div className="card">
        <h2 className="font-semibold text-charcoal mb-4">Order Details</h2>
        <div className="space-y-3 mb-4">
          {order.items.map((oi) => (
            <div key={oi.id} className="flex justify-between text-sm">
              <span className="text-charcoal-600">
                {oi.menu_item?.name ?? `Item ${oi.item_id}`} × {oi.quantity}
                {oi.special_instruction && <span className="block text-xs text-charcoal-400">📝 {oi.special_instruction}</span>}
              </span>
              <span className="font-medium">{formatPrice(oi.price * oi.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 flex justify-between font-bold text-charcoal">
          <span>Total</span>
          <span>{formatPrice(order.total_amount)}</span>
        </div>
      </div>

      {/* Timing */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <Clock className="h-6 w-6 text-seagreen mx-auto mb-2" />
          <div className="text-xs text-charcoal-400 font-medium mb-1">ESTIMATED READY</div>
          <div className="text-xl font-bold text-charcoal">
            {order.estimated_ready_time ? formatTime(order.estimated_ready_time) : 'Calculating...'}
          </div>
        </div>
        <div className="card text-center">
          <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
          <div className="text-xs text-charcoal-400 font-medium mb-1">PICKUP TIME</div>
          <div className="text-xl font-bold text-charcoal">
            {order.pickup_time ? formatTime(order.pickup_time) : 'ASAP'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => navigate(`/track/${order.id}`)}
          className="btn-primary w-full btn-lg"
        >
          Track My Order <ArrowRight className="h-5 w-5" />
        </button>
        <button
          onClick={() => navigate('/menu')}
          className="btn-ghost w-full"
        >
          Order More Food
        </button>
      </div>
    </div>
  );
}

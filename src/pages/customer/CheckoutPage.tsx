import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CalendarClock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { slotsDB } from '../../lib/db';
import { estimatePreparationTime } from '../../services/queueService';
import { createOrder } from '../../services/orderService';
import { formatPrice, formatTime } from '../../utils/format';
import { nanoid } from '../../utils/nanoid';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const idempotencyKey = useRef(nanoid());

  const slots = slotsDB.getAll().filter((s) => s.is_active);

  // Estimate prep time based on cart
  const mockOrder = {
    id: 'tmp', customer_id: '', token_number: '', items: items.map((c) => ({
      id: '', order_id: '', item_id: c.menu_item.id, menu_item: c.menu_item,
      quantity: c.quantity, price: c.menu_item.price,
    })),
    total_amount: 0, order_time: new Date().toISOString(),
    order_status: 'placed' as const, payment_status: 'pending' as const,
    priority_score: 50, created_at: '', updated_at: '',
  };
  const prepMinutes = estimatePreparationTime(mockOrder as any);
  const estimatedReady = new Date(Date.now() + prepMinutes * 60000);

  if (!user || items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    setError('');
    setSubmitting(true);
    try {
      const order = await createOrder({
        customer: user,
        items: items.map((c) => ({
          item_id: c.menu_item.id,
          quantity: c.quantity,
          special_instruction: c.special_instruction,
        })),
        pickup_slot_id: selectedSlot ?? undefined,
        special_notes: notes,
        idempotency_key: idempotencyKey.current,
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place order.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="section-title mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Order Review */}
          <div className="card">
            <h2 className="font-semibold text-charcoal mb-4">Order Review</h2>
            <div className="space-y-3">
              {items.map(({ menu_item: item, quantity, special_instruction }) => (
                <div key={item.id} className="flex items-start gap-3">
                  <img
                    src={item.image_url} alt={item.name}
                    className="h-12 w-12 rounded-lg object-cover shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'; }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-charcoal text-sm">{item.name} × {quantity}</span>
                      <span className="font-semibold text-charcoal text-sm">{formatPrice(item.price * quantity)}</span>
                    </div>
                    {special_instruction && (
                      <p className="text-xs text-charcoal-400 mt-0.5">📝 {special_instruction}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prep Time */}
          <div className="card bg-seagreen-50 border border-seagreen-200">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-seagreen shrink-0" />
              <div>
                <div className="font-semibold text-charcoal">Estimated Preparation Time</div>
                <div className="text-2xl font-bold text-seagreen">{prepMinutes} minutes</div>
                <div className="text-sm text-charcoal-400">
                  Estimated ready at: <strong>{formatTime(estimatedReady.toISOString())}</strong>
                </div>
                <div className="text-xs text-charcoal-400 mt-0.5">
                  Based on {items.reduce((s, i) => s + i.quantity, 0)} items and current kitchen workload
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Slot */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-charcoal">Select Pickup Time <span className="text-charcoal-400 font-normal text-sm">(optional)</span></h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedSlot(null)}
                className={clsx('p-3 rounded-xl border text-sm font-medium text-center transition-all',
                  !selectedSlot ? 'border-primary bg-primary/5 text-primary' : 'border-charcoal-200 hover:border-primary/30 text-charcoal'
                )}
              >
                <div className="font-semibold">ASAP</div>
                <div className="text-xs text-charcoal-400">As soon as ready</div>
              </button>
              {slots.map((slot) => {
                const full = slot.status === 'full' || slot.status === 'closed';
                const filling = slot.status === 'filling_up';
                return (
                  <button
                    key={slot.id}
                    onClick={() => !full && setSelectedSlot(slot.id)}
                    disabled={full}
                    className={clsx('p-3 rounded-xl border text-sm text-center transition-all',
                      full ? 'border-charcoal-100 bg-charcoal-50 text-charcoal-300 cursor-not-allowed' :
                      selectedSlot === slot.id ? 'border-primary bg-primary/5 text-primary font-medium' :
                      'border-charcoal-200 hover:border-primary/30 text-charcoal'
                    )}
                  >
                    <div className="font-semibold">{slot.start_time} – {slot.end_time}</div>
                    <div className={clsx('text-xs mt-0.5',
                      full ? 'text-red-400' : filling ? 'text-amber-500' : 'text-seagreen'
                    )}>
                      {full ? '⛔ FULL' : filling ? `⚡ ${slot.current_orders}/${slot.maximum_orders}` : `✓ ${slot.current_orders}/${slot.maximum_orders}`}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedSlot && (
              <div className="mt-3 p-3 bg-seagreen-50 border border-seagreen-200 rounded-lg text-sm text-seagreen-700">
                <strong>Smart Scheduling:</strong> Your order will be timed for preparation to be complete close to your pickup time.
              </div>
            )}
          </div>

          {/* Special Notes */}
          <div className="card">
            <label htmlFor="notes" className="label">Additional Notes <span className="text-charcoal-400 font-normal">(optional)</span></label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="Any additional instructions for your whole order..."
              maxLength={200}
            />
          </div>
        </div>

        {/* Summary sidebar */}
        <div>
          <div className="card sticky top-24">
            <h2 className="font-semibold text-charcoal mb-4">Order Total</h2>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-charcoal-500">
                <span>Subtotal</span>
                <span>{formatPrice(total())}</span>
              </div>
              <div className="flex justify-between text-charcoal-400">
                <span>Service fee</span>
                <span className="text-seagreen">Free</span>
              </div>
              <div className="flex justify-between font-bold text-charcoal text-base border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(total())}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="flex items-center gap-2 p-3 bg-seagreen-50 border border-seagreen-200 rounded-xl mb-4 text-sm text-seagreen-700">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Pay at counter (cash/card accepted)</span>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-600" role="alert">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="btn-primary w-full btn-lg"
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Placing Order...</>
              ) : (
                <>Place Order — {formatPrice(total())}</>
              )}
            </button>
            <p className="text-xs text-charcoal-400 text-center mt-2">
              By placing order you confirm your selection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

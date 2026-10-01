import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Package } from 'lucide-react';
import { verifyToken, confirmCollection } from '../../services/orderService';
import { useAuthStore } from '../../store/authStore';
import { formatPrice, formatTime } from '../../utils/format';
import { OrderStatusBadge } from '../../components/ui/StatusBadge';
import type { Order } from '../../types';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

type VerifyResult = {
  valid: boolean;
  order?: Order;
  message: string;
};

export default function TokenVerificationPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (searchParams.get('token')) {
      handleVerify(searchParams.get('token')!);
    }
  }, []);

  const handleVerify = (t?: string) => {
    const tokenToCheck = (t ?? token).toUpperCase().trim();
    if (!tokenToCheck) {
      toast.error('Please enter a token');
      return;
    }
    const res = verifyToken(tokenToCheck);
    setResult(res);
  };

  const handleConfirmCollection = async () => {
    if (!result?.order || !user) return;
    setConfirming(true);
    try {
      confirmCollection(result.order.id, user);
      toast.success('Collection confirmed!');
      setResult({
        valid: false,
        order: result.order,
        message: 'Order has been collected and completed.',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Token Verification</h1>
        <p className="text-charcoal-500 text-sm mt-1">Enter token number to verify collection</p>
      </div>

      {/* Input */}
      <div className="card">
        <label htmlFor="token-input" className="block text-sm font-semibold text-charcoal-700 mb-2">
          Token Number
        </label>
        <div className="flex gap-2">
          <input
            id="token-input"
            type="text"
            value={token}
            onChange={(e) => {
              setToken(e.target.value.toUpperCase());
              setResult(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            placeholder="e.g. C-021"
            className="flex-1 bg-white border border-charcoal-200 text-charcoal rounded-xl px-4 py-3 text-lg font-mono font-bold uppercase focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-charcoal-400"
            autoFocus
            autoCapitalize="characters"
          />
          <button
            onClick={() => handleVerify()}
            className="btn-primary px-5 py-3 rounded-xl"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-charcoal-400 mt-2">Token format: C-XXX</p>
      </div>

      {/* Result */}
      {result && (
        <div className={clsx(
          'card border animate-slide-up',
          result.valid
            ? 'bg-seagreen-50/60 border-seagreen-300'
            : result.order?.order_status === 'collected' || result.order?.order_status === 'completed'
            ? 'bg-white border-charcoal-200'
            : 'bg-red-50/60 border-red-300'
        )}>
          {/* Status icon */}
          <div className="flex items-center gap-3 mb-4">
            {result.valid ? (
              <CheckCircle className="h-8 w-8 text-seagreen" />
            ) : result.order?.order_status === 'collected' || result.order?.order_status === 'completed' ? (
              <Package className="h-8 w-8 text-charcoal-400" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <div className={clsx('font-bold text-lg',
                result.valid ? 'text-seagreen-700' :
                result.order?.order_status === 'collected' ? 'text-charcoal-700' : 'text-red-700'
              )}>
                {result.valid ? 'Token Verified ✓' :
                 result.order?.order_status === 'collected' || result.order?.order_status === 'completed' ? 'Already Collected' :
                 'Invalid Token'}
              </div>
              <div className={clsx('text-sm', result.valid ? 'text-seagreen-600' : 'text-charcoal-500')}>
                {result.message}
              </div>
            </div>
          </div>

          {/* Order details */}
          {result.order && (
            <div className="rounded-xl p-4 mb-4 bg-charcoal-50/60 border border-charcoal-100">
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl font-black text-primary">{result.order.token_number}</div>
                <OrderStatusBadge status={result.order.order_status} />
              </div>
              <div className="space-y-2 text-sm">
                {result.order.items.map((oi) => (
                  <div key={oi.id} className="flex justify-between text-charcoal">
                    <span>{oi.menu_item?.name ?? 'Item'} × {oi.quantity}</span>
                    <span className="font-medium">{formatPrice(oi.price * oi.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-charcoal border-t border-charcoal-200 pt-2">
                  <span>Total</span>
                  <span>{formatPrice(result.order.total_amount)}</span>
                </div>
              </div>

              {result.order.pickup_time && (
                <div className="text-xs text-charcoal-400 mt-2">
                  Pickup: {formatTime(result.order.pickup_time)}
                </div>
              )}
            </div>
          )}

          {/* Confirm collection button */}
          {result.valid && result.order && (
            <button
              onClick={handleConfirmCollection}
              disabled={confirming}
              className="btn-secondary w-full btn-lg"
            >
              {confirming ? 'Confirming...' : '✅ Confirm Collection'}
            </button>
          )}

          {/* Try again */}
          {!result.valid && (
            <button
              onClick={() => { setResult(null); setToken(''); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-charcoal-600 border border-charcoal-200 rounded-xl hover:bg-beige transition-colors"
            >
              Try Another Token
            </button>
          )}
        </div>
      )}

      {/* Info */}
      <div className="card text-sm text-charcoal-500">
        <div className="font-semibold text-charcoal mb-2">How to verify:</div>
        <ol className="list-decimal list-inside space-y-1">
          <li>Ask the customer to show their token or QR code</li>
          <li>Enter the token number (e.g. C-023)</li>
          <li>Confirm the order details match</li>
          <li>Click "Confirm Collection"</li>
        </ol>
      </div>
    </div>
  );
}

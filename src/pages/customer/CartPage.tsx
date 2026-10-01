import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageSquare } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/format';
import EmptyState from '../../components/ui/EmptyState';
import { useState } from 'react';
import { clsx } from 'clsx';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, updateInstruction, total, itemCount } = useCartStore();
  const [editingInstruction, setEditingInstruction] = useState<string | null>(null);
  const [instructionText, setInstructionText] = useState('');

  if (items.length === 0) {
    return (
      <div>
        <h1 className="section-title mb-6">Your Cart</h1>
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12 text-charcoal-300" />}
          title="Your cart is empty"
          description="Browse the menu and add items to get started."
          action={<button onClick={() => navigate('/menu')} className="btn-primary">Browse Menu</button>}
        />
      </div>
    );
  }

  const subtotal = total();
  const count = itemCount();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Your Cart</h1>
          <p className="section-subtitle">{count} item{count !== 1 ? 's' : ''} selected</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ menu_item: item, quantity, special_instruction }) => (
            <div key={item.id} className="card">
              <div className="flex gap-4">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-20 w-20 rounded-xl object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-charcoal leading-snug">{item.name}</h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="shrink-0 text-charcoal-300 hover:text-red-500 transition-colors p-0.5"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-charcoal-400 mb-3">{formatPrice(item.price)} each</div>

                  <div className="flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, quantity - 1)}
                        className="h-8 w-8 rounded-lg bg-beige flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center font-semibold">{quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, quantity + 1)}
                        disabled={quantity >= item.available_quantity}
                        className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-600 transition-colors disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      {quantity >= item.available_quantity && (
                        <span className="text-xs text-primary">Max</span>
                      )}
                    </div>
                    <span className="font-bold text-charcoal">{formatPrice(item.price * quantity)}</span>
                  </div>

                  {/* Special instruction */}
                  {editingInstruction === item.id ? (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={instructionText}
                        onChange={(e) => setInstructionText(e.target.value)}
                        placeholder="e.g. Extra sauce, no pickles..."
                        className="input text-xs py-1.5"
                        maxLength={120}
                        autoFocus
                        onBlur={() => {
                          updateInstruction(item.id, instructionText);
                          setEditingInstruction(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateInstruction(item.id, instructionText);
                            setEditingInstruction(null);
                          }
                        }}
                      />
                      <p className="text-xs text-charcoal-400 mt-1">Press Enter to save</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingInstruction(item.id);
                        setInstructionText(special_instruction ?? '');
                      }}
                      className={clsx('mt-2 flex items-center gap-1.5 text-xs transition-colors',
                        special_instruction ? 'text-seagreen' : 'text-charcoal-400 hover:text-primary'
                      )}
                    >
                      <MessageSquare className="h-3 w-3" />
                      {special_instruction || 'Add special instructions'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="font-semibold text-charcoal mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {items.map(({ menu_item: item, quantity }) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-charcoal-500 truncate pr-2">{item.name} × {quantity}</span>
                  <span className="text-charcoal font-medium shrink-0">{formatPrice(item.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mb-2 flex justify-between">
              <span className="font-medium text-charcoal-500">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-charcoal-400 mb-1">
              <span>Service fee</span>
              <span className="text-seagreen font-medium">Free</span>
            </div>
            <div className="border-t pt-4 flex justify-between mb-6">
              <span className="font-bold text-charcoal text-lg">Total</span>
              <span className="font-bold text-charcoal text-lg">{formatPrice(subtotal)}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full btn-lg"
            >
              Proceed to Checkout <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="btn-ghost w-full mt-2 text-sm"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

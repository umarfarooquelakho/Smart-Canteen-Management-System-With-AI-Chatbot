import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Clock, Star, Plus, ShoppingCart, X } from 'lucide-react';
import { menuDB, categoriesDB } from '../../lib/db';
import { useCartStore } from '../../store/cartStore';
import { useAppStore } from '../../store/appStore';
import { formatPrice } from '../../utils/format';
import { ItemStatusBadge } from '../../components/ui/StatusBadge';
import type { MenuFilters, SortOption, MenuItem } from '../../types';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

export default function MenuPage() {
  const navigate = useNavigate();
  const menuVersion = useAppStore((s) => s.menuVersion);
  const { addItem, items: cartItems, itemCount } = useCartStore();

  const allItems = menuDB.getAll();
  const categories = categoriesDB.getAll();

  const [filters, setFilters] = useState<MenuFilters>({
    sort: 'popular',
    availability: ['available', 'limited'],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [qty, setQty] = useState(1);

  const filtered = useMemo(() => {
    let result = [...allItems];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((i) =>
        i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }

    if (filters.category_id) {
      result = result.filter((i) => i.category_id === filters.category_id);
    }

    if (filters.availability && filters.availability.length > 0) {
      result = result.filter((i) => filters.availability!.includes(i.status));
    }

    if (filters.price_max) {
      result = result.filter((i) => i.price <= filters.price_max!);
    }

    if (filters.price_min) {
      result = result.filter((i) => i.price >= filters.price_min!);
    }

    if (filters.preparation_time_max) {
      result = result.filter((i) => i.preparation_time <= filters.preparation_time_max!);
    }

    result.sort((a, b) => {
      switch (filters.sort) {
        case 'popular':       return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0);
        case 'price_asc':     return a.price - b.price;
        case 'price_desc':    return b.price - a.price;
        case 'fastest':       return a.preparation_time - b.preparation_time;
        default:              return 0;
      }
    });

    return result;
  }, [allItems, filters]);

  const cartCount = itemCount();

  const handleAdd = (item: MenuItem) => {
    if (item.status === 'sold_out') return;
    setSelectedItem(item);
    setQty(1);
  };

  const confirmAdd = () => {
    if (!selectedItem) return;
    addItem(selectedItem, qty);
    toast.success(`${selectedItem.name} × ${qty} added to cart`);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Menu</h1>
          <p className="section-subtitle">{filtered.length} items available</p>
        </div>
        {cartCount > 0 && (
          <button onClick={() => navigate('/cart')} className="btn-primary relative">
            <ShoppingCart className="h-4 w-4" />
            View Cart
            <span className="absolute -top-2 -right-2 h-5 w-5 bg-charcoal text-white text-xs rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        )}
      </div>

      {/* Search + Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <input
            type="search"
            placeholder="Search food, drinks..."
            value={filters.search ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="input pl-9"
            aria-label="Search menu"
          />
        </div>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as SortOption }))}
          className="input w-auto pr-8"
          aria-label="Sort options"
        >
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="fastest">Fastest Prep</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx('btn-outline p-2.5', showFilters && 'bg-primary text-white border-primary')}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setFilters((f) => ({ ...f, category_id: undefined }))}
          className={clsx('shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
            !filters.category_id ? 'bg-primary text-white border-primary' : 'bg-white text-charcoal-600 border-charcoal-200 hover:border-primary/40'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilters((f) => ({ ...f, category_id: f.category_id === cat.id ? undefined : cat.id }))}
            className={clsx('shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap',
              filters.category_id === cat.id
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-charcoal-600 border-charcoal-200 hover:border-primary/40'
            )}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="card grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Max Price (Rs.)</label>
            <input
              type="number" min={0} step={50}
              value={filters.price_max ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, price_max: e.target.value ? +e.target.value : undefined }))}
              className="input" placeholder="e.g. 500"
            />
          </div>
          <div>
            <label className="label">Max Prep Time (min)</label>
            <input
              type="number" min={0} step={5}
              value={filters.preparation_time_max ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, preparation_time_max: e.target.value ? +e.target.value : undefined }))}
              className="input" placeholder="e.g. 10"
            />
          </div>
          <div>
            <label className="label">Availability</label>
            <select
              value={(filters.availability ?? []).join(',')}
              onChange={(e) => {
                const val = e.target.value;
                setFilters((f) => ({
                  ...f,
                  availability: val === 'all' ? ['available', 'limited', 'sold_out']
                    : val === 'available_only' ? ['available']
                    : ['available', 'limited'],
                }));
              }}
              className="input"
            >
              <option value="available,limited">Available & Limited</option>
              <option value="available_only">Available Only</option>
              <option value="all">Show All</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ sort: 'popular', availability: ['available', 'limited'] })}
              className="btn-ghost w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🍽️"
          title="No items found"
          description="Try adjusting your search or filters."
          action={
            <button onClick={() => setFilters({ sort: 'popular', availability: ['available', 'limited'] })} className="btn-outline">
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const inCart = cartItems.find((c) => c.menu_item.id === item.id);
            const unavailable = item.status === 'sold_out' || item.status === 'temporarily_unavailable';

            return (
              <div key={item.id} className={clsx('card overflow-hidden p-0 flex flex-col', unavailable && 'opacity-70')}>
                {/* Image */}
                <div className="relative h-48 overflow-hidden rounded-t-2xl bg-beige-100">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <ItemStatusBadge status={item.status} />
                    {item.is_popular && (
                      <span className="badge bg-white/90 text-charcoal text-[10px]">
                        <Star className="h-2.5 w-2.5 text-primary" /> Popular
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-charcoal mb-1 leading-snug">{item.name}</h3>
                  <p className="text-xs text-charcoal-400 mb-3 line-clamp-2 leading-relaxed flex-1">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-charcoal-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {item.preparation_time} min
                    </span>
                    <span>·</span>
                    <span>{item.available_quantity} available</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-charcoal">{formatPrice(item.price)}</span>
                    {unavailable ? (
                      <span className="text-xs text-charcoal-400 font-medium">Unavailable</span>
                    ) : inCart ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => useCartStore.getState().updateQty(item.id, inCart.quantity - 1)} className="h-7 w-7 rounded-lg bg-beige flex items-center justify-center text-charcoal font-bold hover:bg-primary hover:text-white transition-colors">−</button>
                        <span className="w-6 text-center text-sm font-semibold">{inCart.quantity}</span>
                        <button onClick={() => useCartStore.getState().updateQty(item.id, inCart.quantity + 1)} className="h-7 w-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold hover:bg-primary-600 transition-colors">+</button>
                      </div>
                    ) : (
                      <button onClick={() => handleAdd(item)} className="btn-primary btn-sm">
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item detail / add modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal/50" onClick={() => setSelectedItem(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up shadow-2xl">
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 btn-ghost p-1.5">
              <X className="h-4 w-4" />
            </button>
            <img
              src={selectedItem.image_url}
              alt={selectedItem.name}
              className="w-full h-40 object-cover rounded-xl mb-4"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'; }}
            />
            <h3 className="font-bold text-lg text-charcoal mb-1">{selectedItem.name}</h3>
            <p className="text-sm text-charcoal-400 mb-4">{selectedItem.description}</p>
            <div className="flex items-center justify-between mb-5">
              <span className="font-bold text-xl text-charcoal">{formatPrice(selectedItem.price)}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="h-9 w-9 rounded-xl bg-beige flex items-center justify-center font-bold text-lg hover:bg-primary hover:text-white transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold text-lg">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(selectedItem.available_quantity, qty + 1))}
                  className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg hover:bg-primary-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedItem(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={confirmAdd} className="btn-primary flex-1">
                Add {qty > 1 ? `× ${qty}` : ''} — {formatPrice(selectedItem.price * qty)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Ticket, ChefHat, CheckCircle, Star, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { menuDB } from '../../lib/db';
import { formatPrice } from '../../utils/format';
import { ItemStatusBadge } from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store/appStore';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';
import heroImg from '../../assets/hero.png';

const HOW_IT_WORKS = [
  { step: '01', icon: '🍔', title: 'Browse Menu', desc: 'Explore our full menu with live availability.' },
  { step: '02', icon: '🛒', title: 'Pre-Order', desc: 'Add items, set quantity, select pickup time.' },
  { step: '03', icon: '🎫', title: 'Get Token', desc: 'Receive your digital token and QR code instantly.' },
  { step: '04', icon: '👨‍🍳', title: 'Kitchen Prepares', desc: 'Track preparation in real time on your phone.' },
  { step: '05', icon: '🔔', title: 'Get Notified', desc: 'We alert you when your order is ready.' },
  { step: '06', icon: '✅', title: 'Collect Food', desc: 'Show token, collect food, skip the queue.' },
];

export default function HomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const menuVersion = useAppStore((s) => s.menuVersion);
  const { addItem } = useCartStore();

  const popularItems = menuDB.getAll()
    .filter((i) => i.is_popular && i.status !== 'sold_out')
    .slice(0, 4);

  return (
    <div className="space-y-10 pb-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-charcoal px-8 py-12 md:py-16">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Zap className="h-3 w-3" /> Pre-Order & Skip the Queue
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Skip the Queue.<br />
            <span className="text-primary">Enjoy Your Meal.</span>
          </h1>
          <p className="text-charcoal-300 text-lg mb-8 leading-relaxed">
            Pre-order food, get your digital token, track preparation in real time, and collect when your order is ready.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/menu')} className="btn-primary btn-lg">
              Order Food <ArrowRight className="h-5 w-5" />
            </button>
            <button onClick={() => navigate('/orders')} className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-2xl border border-white/20 text-white hover:bg-white/10 transition-colors">
              Track Order
            </button>
          </div>
        </div>
        {/* Hero Image — circular with animated glow ring */}
        <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center w-64 h-64 lg:w-72 lg:h-72">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/40 animate-spin" style={{ animationDuration: '12s' }} />
            {/* Inner glow */}
            <div className="absolute inset-3 rounded-full bg-primary/15 blur-xl" />
            {/* Circular image */}
            <img
              src={heroImg}
              alt="FataFat Food"
              className="relative z-10 w-52 h-52 lg:w-60 lg:h-60 object-cover rounded-full border-4 border-primary/60 shadow-2xl hover:scale-105 transition-transform duration-500"
            />
            {/* Small floating food icons around the circle */}
            <span className="absolute top-2 right-6 text-2xl animate-bounce" style={{ animationDelay: '0ms', animationDuration: '2.5s' }}>🍔</span>
            <span className="absolute bottom-4 right-2 text-xl animate-bounce" style={{ animationDelay: '400ms', animationDuration: '2.8s' }}>🥤</span>
            <span className="absolute top-6 left-2 text-xl animate-bounce" style={{ animationDelay: '800ms', animationDuration: '3s' }}>🍟</span>
            <span className="absolute bottom-2 left-8 text-lg animate-bounce" style={{ animationDelay: '200ms', animationDuration: '2.6s' }}>🎫</span>
          </div>
        </div>
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full -translate-y-28 translate-x-28 blur-2xl" />
      </section>

      {/* Stats strip */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { icon: Clock, label: 'Avg Ready Time', value: '12 min' },
          { icon: Ticket, label: 'Orders Today', value: '186+' },
          { icon: Star, label: 'Satisfaction', value: '4.8/5' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card text-center py-5">
            <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-charcoal">{value}</div>
            <div className="text-xs text-charcoal-400 mt-0.5">{label}</div>
          </div>
        ))}
      </section>

      {/* Popular Items */}
      {popularItems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Popular Right Now</h2>
              <p className="section-subtitle">Most ordered items today</p>
            </div>
            <button onClick={() => navigate('/menu')} className="btn-ghost text-primary font-semibold">
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularItems.map((item) => (
              <div key={item.id} className="card-hover group overflow-hidden p-0">
                {/* Circular image container */}
                <div className="flex justify-center pt-5 pb-2">
                  <div className="relative">
                    {/* Outer animated ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-spin" style={{ animationDuration: '10s' }} />
                    {/* Image */}
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'; }}
                    />
                    {/* Status badge overlaid bottom-right of circle */}
                    <div className="absolute -bottom-1 -right-1">
                      <ItemStatusBadge status={item.status} />
                    </div>
                  </div>
                </div>
                <div className="p-4 pt-2 text-center">
                  {item.is_popular && (
                    <div className="flex justify-center mb-1.5">
                      <span className="badge bg-primary text-white text-[10px]">
                        <Star className="h-2.5 w-2.5" /> Popular
                      </span>
                    </div>
                  )}
                  <h3 className="font-semibold text-charcoal text-sm mb-0.5 truncate">{item.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-xs text-charcoal-400 mb-3">
                    <Clock className="h-3 w-3" /> {item.preparation_time} min
                    <span>·</span>
                    <span>{item.available_quantity} left</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal">{formatPrice(item.price)}</span>
                    <button
                      onClick={() => { addItem(item); toast.success(`${item.name} added to cart`); }}
                      className="btn-primary btn-sm py-1.5"
                      disabled={item.status === 'sold_out'}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section>
        <div className="text-center mb-8">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Six simple steps to a better canteen experience</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
            <div key={step} className="card relative overflow-hidden group hover:shadow-card-hover transition-shadow">
              <div className="absolute top-3 right-3 text-5xl opacity-10 group-hover:opacity-20 transition-opacity">{icon}</div>
              <div className="text-xs font-bold text-primary mb-2">{step}</div>
              <h3 className="font-semibold text-charcoal text-sm mb-1">{title}</h3>
              <p className="text-xs text-charcoal-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="card bg-primary text-white overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Why Pre-Order?</h2>
          <p className="text-white/80 mb-6">Save time, reduce stress, enjoy your meal break.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { title: 'No Waiting in Line', desc: 'Your food is ready when you arrive.' },
              { title: 'Real-Time Tracking', desc: 'Watch your order progress live.' },
              { title: 'Digital Token', desc: 'Secure QR code for collection.' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-white/70 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">{title}</div>
                  <div className="text-xs text-white/70 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/menu')} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-semibold text-sm hover:bg-beige transition-colors">
            Start Ordering <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute right-0 bottom-0 text-9xl opacity-10">🎫</div>
      </section>
    </div>
  );
}

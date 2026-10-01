import {
  getDashboardStats, getPopularItems, getLeastOrderedItems,
  getSalesByDay, getOrdersByHour, getPickupSlotUsage,
  getDelayedOrderPercentage, generateAIInsights,
} from '../../services/analyticsService';
import { availabilityHistoryDB, cancellationsDB } from '../../lib/db';
import { formatPrice, formatDateTime } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Brain, LogOut } from 'lucide-react';

const COLORS = ['#C94720', '#4F9D8A', '#171717', '#c9a35a'];

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const stats = getDashboardStats();
  const popular = getPopularItems(5);
  const least = getLeastOrderedItems(3);
  const salesByDay = getSalesByDay().slice(-14);
  const ordersByHour = getOrdersByHour();
  const slotUsage = getPickupSlotUsage();
  const delayedPct = getDelayedOrderPercentage();
  const insights = generateAIInsights();
  const availHistory = availabilityHistoryDB.getAll().slice(0, 8);
  const cancellations = cancellationsDB.getAll().slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="section-title">Analytics & Reports</h1>
          <p className="section-subtitle">Performance insights and historical data</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-200 shadow-sm cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue Today', value: formatPrice(stats.total_sales), color: 'text-primary' },
          { label: 'Avg Prep Time',        value: `${stats.avg_preparation_time} min`, color: 'text-charcoal' },
          { label: 'Delayed Orders',       value: `${delayedPct}%`, color: 'text-amber-600' },
          { label: 'Completion Rate',      value: `${stats.total_orders_today > 0 ? Math.round(stats.completed_orders / stats.total_orders_today * 100) : 0}%`, color: 'text-seagreen' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-charcoal-400 font-medium mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales by day */}
        <div className="card">
          <h2 className="font-semibold text-charcoal mb-4">Sales (Last 14 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesByDay} margin={{ top: 0, right: 0, bottom: 0, left: -15 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C94720" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#C94720" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: unknown) => [formatPrice(v as number), 'Sales']}
                labelFormatter={(l: unknown) => new Date(l as string).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="total_sales" stroke="#C94720" strokeWidth={2}
                fill="url(#salesGrad)" name="Sales" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by hour */}
        <div className="card">
          <h2 className="font-semibold text-charcoal mb-4">Orders by Hour</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersByHour} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="order_count" fill="#4F9D8A" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Popular items */}
        <div className="card">
          <h2 className="font-semibold text-charcoal mb-4">Most Popular Items</h2>
          <div className="space-y-3">
            {popular.map((item, idx) => (
              <div key={item.item_id} className="flex items-center gap-3">
                <span className="text-lg font-bold text-charcoal-300 w-5">{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-charcoal">{item.item_name}</span>
                    <span className="text-sm text-charcoal-400">{item.order_count} orders</span>
                  </div>
                  <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((item.order_count / (popular[0]?.order_count || 1)) * 100)}%`,
                        backgroundColor: COLORS[idx % COLORS.length]
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-charcoal shrink-0">{formatPrice(item.total_revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slot usage */}
        <div className="card">
          <h2 className="font-semibold text-charcoal mb-4">Pickup Slot Utilization</h2>
          <div className="space-y-3">
            {slotUsage.slice(0, 6).map((slot) => (
              <div key={slot.slot_label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-charcoal">{slot.slot_label}</span>
                  <span className="text-charcoal-400">{slot.usage_count}/{slot.capacity}</span>
                </div>
                <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${slot.utilization_percent}%`,
                      backgroundColor: slot.utilization_percent >= 90 ? '#C94720' :
                                        slot.utilization_percent >= 70 ? '#c9a35a' : '#4F9D8A'
                    }}
                  />
                </div>
                <div className="text-xs text-charcoal-400 mt-0.5">{slot.utilization_percent}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Availability history */}
      <div className="card">
        <h2 className="font-semibold text-charcoal mb-4">Item Availability History</h2>
        {availHistory.length === 0 ? (
          <p className="text-charcoal-400 text-sm">No availability changes recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  {['Item', 'Old Status', 'New Status', 'Qty Change', 'Changed', 'By'].map((h) => (
                    <th key={h} className="pb-2 text-xs font-semibold text-charcoal-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {availHistory.map((h) => (
                  <tr key={h.id} className="border-b last:border-0">
                    <td className="py-2 font-medium text-charcoal">{h.item_name}</td>
                    <td className="py-2"><span className="badge bg-charcoal-100 text-charcoal-500 text-xs">{h.old_status}</span></td>
                    <td className="py-2"><span className="badge bg-primary/10 text-primary text-xs">{h.new_status}</span></td>
                    <td className="py-2 text-charcoal-500">{h.old_quantity} → {h.new_quantity}</td>
                    <td className="py-2 text-charcoal-400 text-xs">{formatDateTime(h.changed_at)}</td>
                    <td className="py-2 text-charcoal-400 text-xs">{h.changed_by === 'system' ? 'System' : 'Staff'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancellations */}
      <div className="card">
        <h2 className="font-semibold text-charcoal mb-4">Cancellation Records</h2>
        {cancellations.length === 0 ? (
          <p className="text-charcoal-400 text-sm">No cancellations recorded.</p>
        ) : (
          <div className="space-y-2">
            {cancellations.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-beige rounded-lg">
                <div>
                  <span className="font-medium text-charcoal text-sm">{c.token_number ?? c.order_id.slice(-6)}</span>
                  <span className="text-xs text-charcoal-400 ml-2">by {c.cancelled_by_role}</span>
                  <p className="text-xs text-charcoal-400">{c.reason}</p>
                </div>
                <span className="text-xs text-charcoal-400">{formatDateTime(c.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-charcoal">AI-Powered Insights</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {insights.map((insight) => (
            <div key={insight.id} className="p-4 bg-beige rounded-xl border border-beige-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {insight.type === 'demand_prediction' ? '📈' :
                   insight.type === 'peak_time' ? '⚡' :
                   insight.type === 'waste_prediction' ? '♻️' :
                   insight.type === 'delay_prediction' ? '⚠️' :
                   insight.type === 'sales_insight' ? '💰' : '💡'}
                </span>
                <span className="font-semibold text-charcoal text-sm">{insight.title}</span>
              </div>
              <p className="text-xs text-charcoal-500 leading-relaxed">{insight.message}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                  <div className="h-full bg-seagreen rounded-full" style={{ width: `${insight.confidence}%` }} />
                </div>
                <span className="text-xs text-charcoal-400">{insight.confidence}% confidence</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


import { getDashboardStats, getPopularItems, generateAIInsights } from '../../services/analyticsService';
import { useAppStore } from '../../store/appStore';
import { ordersDB } from '../../lib/db';
import { formatPrice, formatDateTime } from '../../utils/format';
import { OrderStatusBadge } from '../../components/ui/StatusBadge';
import { Zap, Brain } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { PEAK_HOURS_DATA } from '../../data/seed';
import { clsx } from 'clsx';

const COLORS = ['#C94720', '#4F9D8A', '#171717', '#F5E8D0'];

export default function ManagerDashboardPage() {
  useAppStore((s) => s.ordersVersion); // subscribe for reactivity
  const stats = getDashboardStats();
  const popular = getPopularItems(5);
  const insights = generateAIInsights();
  const recentOrders = ordersDB.getTodaysOrders().slice(0, 5);

  const KPI = ({ label, value, sub, color = '' }: { label: string; value: string | number; sub?: string; color?: string }) => (
    <div className="stat-card">
      <div className={clsx('stat-value', color)}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="text-xs text-charcoal-400">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Manager Dashboard</h1>
        <p className="section-subtitle">Real-time canteen overview</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Orders Today"     value={stats.total_orders_today}  color="text-charcoal" />
        <KPI label="Active Orders"    value={stats.active_orders}       color="text-amber-600" />
        <KPI label="Preparing"        value={stats.orders_preparing}    color="text-amber-600" />
        <KPI label="Ready"            value={stats.orders_ready}        color="text-seagreen" />
        <KPI label="Completed"        value={stats.completed_orders}    color="text-seagreen" />
        <KPI label="Cancelled"        value={stats.cancelled_orders}    color="text-charcoal-400" />
        <KPI label="Total Sales"      value={formatPrice(stats.total_sales)} color="text-primary" />
        <KPI label="Avg Prep Time"    value={`${stats.avg_preparation_time} min`} color="text-charcoal" />
      </div>

      {/* Recent orders - placed above graphs */}
      <div className="card">
        <h2 className="font-semibold text-charcoal mb-4">Today's Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className="text-center py-6 text-charcoal-400 text-sm">No orders yet today</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-charcoal-400">Token</th>
                  <th className="pb-2 font-medium text-charcoal-400">Customer</th>
                  <th className="pb-2 font-medium text-charcoal-400">Items</th>
                  <th className="pb-2 font-medium text-charcoal-400">Amount</th>
                  <th className="pb-2 font-medium text-charcoal-400">Status</th>
                  <th className="pb-2 font-medium text-charcoal-400">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-2.5 font-bold text-primary">{order.token_number}</td>
                    <td className="py-2.5 text-charcoal-600">{order.customer?.name ?? 'Customer'}</td>
                    <td className="py-2.5 text-charcoal-400">{order.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                    <td className="py-2.5 font-medium">{formatPrice(order.total_amount)}</td>
                    <td className="py-2.5"><OrderStatusBadge status={order.order_status} /></td>
                    <td className="py-2.5 text-charcoal-400 text-xs">{formatDateTime(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Graphs - placed below the table */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Peak Hours chart */}
        <div className="card">
          <h2 className="font-semibold text-charcoal mb-4">Orders by Hour</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PEAK_HOURS_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '12px' }}
              />
              <Bar dataKey="order_count" fill="#C94720" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular items pie */}
        <div className="card">
          <h2 className="font-semibold text-charcoal mb-4">Top Ordered Items</h2>
          {popular.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={popular.map((p) => ({ name: p.item_name, value: p.order_count }))}
                  cx="50%" cy="50%" outerRadius={70}
                  dataKey="value"
                  label={({ name: n, percent: p }: { name?: string; percent?: number }) => `${(n ?? '').split(' ')[0]} ${((p ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {popular.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-charcoal-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-charcoal">AI Insights</h2>
          <span className="badge bg-primary/10 text-primary text-xs">Smart</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {insights.slice(0, 4).map((insight) => (
            <div key={insight.id} className="p-3 bg-beige rounded-xl border border-beige-200">
              <div className="flex items-start gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="font-medium text-charcoal text-sm">{insight.title}</span>
              </div>
              <p className="text-xs text-charcoal-500 leading-relaxed">{insight.message}</p>
              <div className="text-xs text-charcoal-400 mt-1.5">
                Confidence: <span className="text-seagreen font-medium">{insight.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

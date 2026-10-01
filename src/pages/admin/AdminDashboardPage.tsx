import { usersDB, ordersDB, staffLogsDB } from '../../lib/db';
import { formatDateTime, timeAgo } from '../../utils/format';
import { Users, ShieldCheck, ChefHat, UserCog, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const users = usersDB.getAll();
  const customers = users.filter((u) => u.role === 'customer');
  const staff     = users.filter((u) => u.role === 'staff');
  const managers  = users.filter((u) => u.role === 'manager');
  const admins    = users.filter((u) => u.role === 'admin');

  const todayOrders = ordersDB.getTodaysOrders();
  const logs = staffLogsDB.getAll().slice(0, 10);

  const stats = [
    { label: 'Total Users',  value: users.length,     icon: Users,      color: 'text-charcoal' },
    { label: 'Customers',    value: customers.length, icon: Users,      color: 'text-seagreen' },
    { label: 'Staff',        value: staff.length,     icon: ChefHat,    color: 'text-amber-600' },
    { label: 'Managers',     value: managers.length,  icon: UserCog,    color: 'text-violet-600' },
    { label: 'Admins',       value: admins.length,    icon: ShieldCheck, color: 'text-primary' },
    { label: 'Orders Today', value: todayOrders.length, icon: Activity,  color: 'text-charcoal' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">System overview and management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-beige flex items-center justify-center shrink-0">
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-sm text-charcoal-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* User breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-charcoal mb-4">All Users</h2>
          <div className="space-y-2">
            {users.slice(0, 8).map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-beige transition-colors">
                <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-charcoal text-sm truncate">{user.name}</div>
                  <div className="text-xs text-charcoal-400 truncate">{user.email}</div>
                </div>
                <span className={`badge text-xs ${
                  user.role === 'admin' ? 'bg-primary/10 text-primary' :
                  user.role === 'manager' ? 'bg-violet-100 text-violet-700' :
                  user.role === 'staff' ? 'bg-amber-100 text-amber-700' :
                  'bg-seagreen-100 text-seagreen-600'
                }`}>{user.role}</span>
                <span className={`badge text-xs ${user.account_status === 'active' ? 'bg-seagreen-100 text-seagreen' : 'bg-charcoal-100 text-charcoal-500'}`}>
                  {user.account_status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff activity */}
        <div className="card">
          <h2 className="font-semibold text-charcoal mb-4">Recent Staff Activity</h2>
          {logs.length === 0 ? (
            <p className="text-charcoal-400 text-sm">No activity logged</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const staffUser = usersDB.getById(log.user_id);
                return (
                  <div key={log.id} className="p-2 rounded-lg hover:bg-beige transition-colors">
                    <div className="flex items-center gap-2">
                      {staffUser && (
                        <img src={staffUser.avatar_url} alt={staffUser.name} className="h-6 w-6 rounded-full" />
                      )}
                      <span className="text-sm font-medium text-charcoal">{staffUser?.name ?? 'Unknown'}</span>
                    </div>
                    <div className="text-xs text-charcoal-500 mt-0.5">{log.action}</div>
                    {log.details && <div className="text-xs text-charcoal-400">{log.details}</div>}
                    <div className="text-xs text-charcoal-300 mt-0.5">{timeAgo(log.created_at)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

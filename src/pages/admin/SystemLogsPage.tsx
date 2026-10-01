import { staffLogsDB, usersDB } from '../../lib/db';
import { timeAgo } from '../../utils/format';

export default function SystemLogsPage() {
  const logs = staffLogsDB.getAll();

  return (
    <div>
      <div className="mb-5">
        <h1 className="section-title">System & Staff Activity Logs</h1>
        <p className="section-subtitle">{logs.length} log entries</p>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-beige">
              <tr>
                {['Staff Member', 'Action', 'Order', 'Details', 'Time'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const user = usersDB.getById(log.user_id);
                return (
                  <tr key={log.id} className="border-t hover:bg-beige/50">
                    <td className="px-4 py-3">
                      {user ? (
                        <div className="flex items-center gap-2">
                          <img src={user.avatar_url} alt={user.name} className="h-6 w-6 rounded-full" />
                          <span className="font-medium text-charcoal">{user.name}</span>
                        </div>
                      ) : (
                        <span className="text-charcoal-400">Unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-charcoal-700">{log.action}</td>
                    <td className="px-4 py-3 text-primary font-medium">
                      {log.order_id ? `#${log.order_id.slice(-6)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-charcoal-400 text-xs">{log.details ?? '—'}</td>
                    <td className="px-4 py-3 text-charcoal-400 text-xs">{timeAgo(log.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="text-center py-10 text-charcoal-400 text-sm">No logs found</div>
          )}
        </div>
      </div>
    </div>
  );
}

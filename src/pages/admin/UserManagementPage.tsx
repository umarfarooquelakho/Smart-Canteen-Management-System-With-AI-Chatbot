import { useState } from 'react';
import { Search, Edit2, UserX, UserCheck, Plus } from 'lucide-react';
import { usersDB } from '../../lib/db';
import Modal from '../../components/ui/Modal';
import type { User, UserRole } from '../../types';
import { nanoid } from '../../utils/nanoid';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'customer' as UserRole });
  const [version, setVersion] = useState(0);

  const users = usersDB.getAll();
  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, role: user.role });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editing) {
      usersDB.update(editing.id, { name: form.name, role: form.role });
      toast.success('User updated');
    } else {
      usersDB.create({
        id: `user-${nanoid(8)}`,
        name: form.name,
        email: form.email,
        role: form.role,
        account_status: 'active',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(form.name)}`,
        created_at: new Date().toISOString(),
      });
      toast.success('User created');
    }
    setShowModal(false);
    setVersion((v) => v + 1);
  };

  const toggleStatus = (user: User) => {
    const newStatus = user.account_status === 'active' ? 'suspended' : 'active';
    usersDB.update(user.id, { account_status: newStatus });
    setVersion((v) => v + 1);
    toast.success(`User ${newStatus}`);
  };

  const ROLES: (UserRole | 'all')[] = ['all', 'customer', 'staff', 'manager', 'admin'];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="section-title">User Management</h1>
          <p className="section-subtitle">{users.length} total users</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', role: 'customer' }); setShowModal(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <input type="search" placeholder="Search users..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <div className="flex gap-1">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={clsx('px-3 py-2 rounded-lg text-xs font-medium border transition-colors capitalize',
                roleFilter === r ? 'bg-primary text-white border-primary' : 'bg-white border-charcoal-200 text-charcoal-600 hover:border-primary/30'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-beige">
              <tr>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t hover:bg-beige/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={user.avatar_url} alt={user.name} className="h-8 w-8 rounded-full" />
                      <span className="font-medium text-charcoal">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${
                      user.role === 'admin' ? 'bg-primary/10 text-primary' :
                      user.role === 'manager' ? 'bg-violet-100 text-violet-700' :
                      user.role === 'staff' ? 'bg-amber-100 text-amber-700' :
                      'bg-seagreen-100 text-seagreen-600'
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.account_status === 'active' ? 'bg-seagreen-100 text-seagreen' : 'bg-red-100 text-red-600'}`}>
                      {user.account_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal-400 text-xs">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(user)} className="btn-ghost p-1.5">
                        <Edit2 className="h-3.5 w-3.5 text-charcoal-500" />
                      </button>
                      <button onClick={() => toggleStatus(user)} className="btn-ghost p-1.5">
                        {user.account_status === 'active'
                          ? <UserX className="h-3.5 w-3.5 text-red-400" />
                          : <UserCheck className="h-3.5 w-3.5 text-seagreen" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-charcoal-400 text-sm">No users found</div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit User' : 'Create User'}>
        <div className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          {!editing && (
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
          )}
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}>
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1">
              {editing ? 'Save' : 'Create User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

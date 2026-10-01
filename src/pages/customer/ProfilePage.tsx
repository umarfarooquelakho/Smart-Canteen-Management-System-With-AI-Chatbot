import { useState } from 'react';
import { User, Mail, Phone, Shield, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateProfile({ name: name.trim(), phone: phone.trim() });
    toast.success('Profile updated!');
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="section-title">Profile</h1>

      {/* Avatar */}
      <div className="card text-center">
        <img
          src={user.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          alt={user.name}
          className="h-20 w-20 rounded-full border-4 border-beige-200 mx-auto mb-3"
        />
        <div className="font-bold text-charcoal text-lg">{user.name}</div>
        <div className="text-charcoal-400 text-sm">{user.email}</div>
        <span className="badge bg-primary/10 text-primary mt-2 capitalize">{user.role}</span>
      </div>

      {/* Edit form */}
      <div className="card">
        <h2 className="font-semibold text-charcoal mb-4">Edit Profile</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <input
                id="profile-name" type="text"
                value={name} onChange={(e) => setName(e.target.value)}
                className="input pl-9"
              />
            </div>
          </div>
          <div>
            <label htmlFor="profile-email" className="label">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <input
                id="profile-email" type="email"
                value={user.email}
                className="input pl-9 opacity-60 cursor-not-allowed"
                disabled
              />
            </div>
            <p className="text-xs text-charcoal-400 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label htmlFor="profile-phone" className="label">Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <input
                id="profile-phone" type="tel"
                value={phone} onChange={(e) => setPhone(e.target.value)}
                className="input pl-9"
                placeholder="+92-300-0000000"
              />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Account info */}
      <div className="card">
        <h2 className="font-semibold text-charcoal mb-3">Account Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-charcoal-500">Role</span>
            <span className="font-medium capitalize">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-500">Status</span>
            <span className="font-medium capitalize text-seagreen">{user.account_status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-500">Member since</span>
            <span className="font-medium">{new Date(user.created_at).getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

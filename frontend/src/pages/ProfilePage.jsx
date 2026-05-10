import { useState } from 'react';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { updateMe } from '../api/auth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '', city: user?.city || '', country: user?.country || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateMe(form);
      setUser(data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-sand">
      <div className="bg-primary text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold">Profile</h1>
          <p className="text-white/70 mt-1">Manage your account settings</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Avatar */}
        <div className="bg-white rounded-card shadow-card p-8 mb-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">{user?.first_name} {user?.last_name}</h2>
            <p className="text-muted">{user?.email}</p>
            <Badge variant="green" className="mt-2">{user?.role}</Badge>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-card shadow-card p-8">
          <h3 className="font-display text-xl font-semibold mb-6">Edit Profile</h3>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              <Input label="Last Name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <Input label="Email" value={user?.email || ''} disabled />
            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              <Input label="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
            </div>
            <Button type="submit" loading={loading} className="px-8">Save Changes</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

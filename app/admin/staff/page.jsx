'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';

const ROLES = ['staff', 'manager', 'admin'];
const DEPARTMENTS = ['reception', 'housekeeping', 'maintenance', 'all'];

function roleBadge(role) {
  switch (role) {
    case 'admin':   return 'text-error bg-error-container';
    case 'manager': return 'text-primary bg-primary-container';
    default:        return 'text-on-secondary-container bg-secondary-container';
  }
}

export default function AdminStaffPage() {
  const { token } = useAuthStore();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff', department: 'reception', phone: '' });

  useEffect(() => {
    if (!token) return;
    adminApi.getStaff(token).then((data) => { setStaffList(data); }).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const staff = await adminApi.createStaff(token, form);
      setStaffList((s) => [...s, staff]);
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', role: 'staff', department: 'reception', phone: '' });
    } catch (e) {
      alert(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(staff) {
    const updated = await adminApi.updateStaff(token, staff.id, { isActive: !staff.isActive });
    setStaffList((s) => s.map((m) => m.id === staff.id ? { ...m, isActive: updated.isActive } : m));
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-background">
      <Spinner size="lg" />
    </div>
  );

  const activeCount = staffList.filter((s) => s.isActive).length;

  return (
    <div className="px-8 py-8 space-y-8 max-w-5xl bg-background min-h-screen text-on-surface font-body">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex gap-2 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-label">
            <span>Admin</span>
            <span className="opacity-30">/</span>
            <span className="text-primary font-bold">Staff</span>
          </nav>
          <h1 className="font-serif text-4xl font-bold text-on-surface">Staff Accounts</h1>
          <p className="text-on-surface-variant text-sm mt-1">{activeCount} active members</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-gradient-to-tr from-primary to-primary-container text-on-primary px-5 py-3 rounded-xl font-label font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Add Staff
        </button>
      </div>

      {/* Create panel */}
      {showCreate && (
        <div className="bg-surface rounded-xl border border-outline-variant/20 shadow-[0_8px_32px_rgba(27,28,25,0.06)] overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant/10 flex justify-between items-center">
            <h2 className="font-serif text-xl text-on-surface">New Staff Account</h2>
            <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-6 grid grid-cols-2 gap-6">
            {[
              { key: 'name',     label: 'Full Name *',  placeholder: 'Priya Sharma',      type: 'text',     required: true },
              { key: 'email',    label: 'Email *',       placeholder: 'priya@teacorps.in', type: 'email',    required: true },
              { key: 'password', label: 'Password *',    placeholder: 'Min 8 characters',  type: 'password', required: true },
              { key: 'phone',    label: 'Phone',         placeholder: '+91XXXXXXXXXX',     type: 'text',     required: false },
            ].map(({ key, label, placeholder, type, required }) => (
              <div key={key} className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-label">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required={required}
                  className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none transition-colors text-sm"
                />
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-label">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary py-3 text-on-surface focus:outline-none transition-colors"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-label">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary py-3 text-on-surface focus:outline-none transition-colors"
              >
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 bg-gradient-to-tr from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-label font-bold text-sm tracking-wide disabled:opacity-60"
              >
                {creating ? <Spinner size="sm" /> : (
                  <><span className="material-symbols-outlined text-sm">person_add</span> Create Account</>
                )}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-6 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-label font-bold text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(27,28,25,0.03)] border border-outline-variant/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {['Member', 'Role', 'Department', 'Resolved', 'Rating', 'Actions'].map((h, i) => (
                <th key={h} className={`px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70 border-b border-outline-variant/10 font-label ${i === 5 ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {staffList.map((s) => (
              <tr key={s.id} className={`hover:bg-surface-container-low/20 transition-colors group ${!s.isActive ? 'opacity-50' : ''}`}>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-container/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {s.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-on-surface text-sm">{s.name}</p>
                      <p className="text-xs text-on-surface-variant/70">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-[10px] font-label font-bold uppercase tracking-wider px-2 py-1 rounded-md ${roleBadge(s.role)}`}>
                    {s.role}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant capitalize">{s.department || '—'}</td>
                <td className="px-6 py-5">
                  <span className="font-serif text-lg font-bold text-on-surface">{s.totalResolved}</span>
                </td>
                <td className="px-6 py-5">
                  {s.avgRating > 0 ? (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1", color: '#d4a855' }}>star</span>
                      <span className="text-sm font-medium text-on-surface">{s.avgRating}</span>
                    </div>
                  ) : (
                    <span className="text-on-surface-variant/50 text-sm">—</span>
                  )}
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleActive(s)}
                      className={`flex items-center gap-1.5 text-xs font-label font-bold px-3 py-1.5 rounded-full border transition-colors ${
                        s.isActive
                          ? 'text-error border-error/20 hover:bg-error/5'
                          : 'text-tertiary border-tertiary/20 hover:bg-tertiary/5'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {s.isActive ? 'person_off' : 'person_check'}
                      </span>
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

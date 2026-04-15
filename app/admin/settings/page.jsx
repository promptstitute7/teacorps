'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';

const CATEGORIES = [
  { key: 'room_service', label: 'Room Service',  icon: 'room_service' },
  { key: 'housekeeping', label: 'Housekeeping',  icon: 'cleaning_services' },
  { key: 'maintenance',  label: 'Maintenance',   icon: 'build' },
  { key: 'front_desk',   label: 'Front Desk',    icon: 'luggage' },
  { key: 'emergency',    label: 'Emergency',     icon: 'emergency_home' },
];

export default function AdminSettingsPage() {
  const { token } = useAuthStore();
  const [sla, setSla] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    adminApi.getSlaSettings(token).then((data) => {
      const map = {};
      data.forEach((s) => { map[s.category] = s.slaMinutes; });
      setSla(map);
      setLoading(false);
    });
  }, [token]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSlaSettings(token, sla);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-background">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="px-8 py-8 space-y-8 max-w-2xl bg-background min-h-screen text-on-surface font-body">
      {/* Header */}
      <div>
        <nav className="flex gap-2 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-label">
          <span>Admin</span>
          <span className="opacity-30">/</span>
          <span className="text-primary font-bold">Settings</span>
        </nav>
        <h1 className="font-serif text-4xl font-bold text-on-surface">Configuration</h1>
        <p className="text-on-surface-variant text-sm mt-1">Configure escalation timers and service defaults</p>
      </div>

      {/* SLA section */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-[0_8px_32px_rgba(27,28,25,0.03)] overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">timer</span>
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface">SLA Escalation Timers</h2>
              <p className="text-xs text-on-surface-variant">Tickets not addressed within these times will auto-escalate.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-0">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.key}
              className={`flex items-center justify-between py-5 ${i < CATEGORIES.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant/60">{cat.icon}</span>
                <span className="text-sm font-medium text-on-surface">{cat.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={sla[cat.key] || ''}
                  onChange={(e) => setSla((s) => ({ ...s, [cat.key]: Number(e.target.value) }))}
                  className="w-16 bg-transparent border-b border-outline-variant/40 focus:border-primary py-2 text-on-surface text-center focus:outline-none transition-colors font-serif text-lg font-bold"
                />
                <span className="text-xs text-on-surface-variant font-label uppercase tracking-widest">min</span>
              </div>
            </div>
          ))}

          <div className="pt-6">
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-label font-bold text-sm tracking-wide transition-all ${
                saved
                  ? 'bg-tertiary-fixed text-tertiary border border-tertiary/20'
                  : 'bg-gradient-to-tr from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 hover:opacity-90'
              } disabled:opacity-60`}
            >
              {saving ? <Spinner size="sm" /> : saved ? (
                <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Saved</>
              ) : (
                <><span className="material-symbols-outlined text-sm">save</span> Save Settings</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info card */}
      <div className="flex items-start gap-4 p-5 bg-surface-container-low rounded-xl border border-outline-variant/10">
        <span className="material-symbols-outlined text-on-surface-variant/60 shrink-0 mt-0.5">info</span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-on-surface">Escalation Engine</p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            The escalation engine runs every 2 minutes and checks all open tickets against their SLA deadlines.
            Tickets escalate up to 3 times before being flagged for manual review.
          </p>
        </div>
      </div>
    </div>
  );
}

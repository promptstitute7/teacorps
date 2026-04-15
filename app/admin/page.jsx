'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { adminApi, staffApi } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';

const KPI_CONFIG = [
  { key: 'totalTickets',       label: "Today's Tickets",  icon: 'confirmation_number', trend: '+12%', trendColor: 'text-emerald-600 bg-emerald-50' },
  { key: 'resolutionRate',     label: 'Resolution Rate',  icon: 'task_alt',            trend: 'Optimal', trendColor: 'text-emerald-600 bg-emerald-50', suffix: '%' },
  { key: 'avgResponseMinutes', label: 'Avg Response',     icon: 'timer',               trend: '-2m',   trendColor: 'text-amber-600 bg-amber-50', suffix: 'm' },
  { key: 'escalationRate',     label: 'Escalation Rate',  icon: 'priority_high',       trend: 'Low',   trendColor: 'text-blue-600 bg-blue-50', suffix: '%' },
];

export default function AdminDashboard() {
  const { token, staff } = useAuthStore();
  const router = useRouter();
  const [metrics, setMetrics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([adminApi.getMetrics(token), staffApi.getLeaderboard(token)])
      .then(([m, lb]) => { setMetrics(m); setLeaderboard(lb.slice(0, 5)); setLoading(false); });
    const interval = setInterval(() => adminApi.getMetrics(token).then(setMetrics), 60000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) return <div className="flex justify-center items-center h-screen bg-background"><Spinner size="lg" /></div>;

  return (
    <div className="flex-1 px-10 py-8 max-w-7xl mx-auto w-full bg-background text-on-surface">

      {/* Header */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-serif tracking-tight text-on-surface mb-2">Executive Overview</h1>
          <p className="text-on-surface-variant text-sm">Welcome back. Here is today's brief for Tea Corp Bangalore.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-primary text-sm font-semibold hover:bg-surface-container transition-all">
            Generate Report
          </button>
          <button className="px-6 py-2.5 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-semibold shadow-xl shadow-primary/10 hover:opacity-90 transition-all">
            System Health
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {KPI_CONFIG.map((kpi) => {
          const val = metrics?.[kpi.key] ?? 0;
          return (
            <div key={kpi.key} className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_32px_48px_rgba(27,28,25,0.03)] border border-outline-variant/10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${kpi.trendColor}`}>{kpi.trend}</span>
              </div>
              <p className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-serif text-on-surface">{val}{kpi.suffix || ''}</h3>
            </div>
          );
        })}
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-8">

        {/* Leaderboard */}
        <section className="col-span-12 lg:col-span-8">
          <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif text-on-surface">Staff Excellence Leaderboard</h2>
              <button onClick={() => router.push('/admin/staff')} className="text-xs font-label text-primary font-bold hover:underline">
                View All Staff
              </button>
            </div>
            <div className="space-y-4">
              {leaderboard.length === 0 ? (
                <p className="text-on-surface-variant text-sm">No data yet this month.</p>
              ) : leaderboard.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <span className={`text-lg font-serif w-6 ${i === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className={`w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center border-2 ${i === 0 ? 'border-primary/20' : 'border-transparent'}`}>
                      <span className="font-serif text-primary text-lg">{s.name[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">{s.name}</h4>
                      <p className="text-xs text-on-surface-variant">{s.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      {s.avgRating > 0 && <p className="text-xs font-bold text-on-surface">{s.avgRating} Satisfaction</p>}
                      <p className="text-[10px] text-on-surface-variant">{s.resolvedThisMonth} Resolutions</p>
                    </div>
                    {s.streakDays >= 3 && (
                      <div className="bg-primary/5 px-3 py-1 rounded-full flex items-center gap-1">
                        <span className="text-xs font-bold text-primary">{s.streakDays}</span>
                        <span className="material-symbols-outlined text-sm text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <button
            onClick={() => router.push('/admin/rooms')}
            className="w-full text-left p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined">bed</span>
            </div>
            <h3 className="font-serif text-lg text-on-surface mb-1">Room Inventory</h3>
            <p className="text-xs text-on-surface-variant">Manage rooms, download QR codes</p>
          </button>

          <button
            onClick={() => router.push('/admin/staff')}
            className="w-full text-left p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined">badge</span>
            </div>
            <h3 className="font-serif text-lg text-on-surface mb-1">Staff Directory</h3>
            <p className="text-xs text-on-surface-variant">Add, edit, deactivate staff accounts</p>
          </button>

          <button
            onClick={() => router.push('/admin/settings')}
            className="w-full text-left p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined">settings</span>
            </div>
            <h3 className="font-serif text-lg text-on-surface mb-1">SLA Settings</h3>
            <p className="text-xs text-on-surface-variant">Configure escalation timers</p>
          </button>
        </aside>
      </div>
    </div>
  );
}

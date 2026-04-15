'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Executive'];

export default function AdminRoomsPage() {
  const { token } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ roomNumber: '', floor: '', roomType: 'Standard' });
  const [regenId, setRegenId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token) return;
    adminApi.getRooms(token).then((data) => { setRooms(data); setLoading(false); });
  }, [token]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const room = await adminApi.createRoom(token, {
        roomNumber: form.roomNumber,
        floor: form.floor ? Number(form.floor) : null,
        roomType: form.roomType || null,
      });
      setRooms((r) => [...r, room]);
      setShowCreate(false);
      setForm({ roomNumber: '', floor: '', roomType: 'Standard' });
    } catch (e) {
      alert(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleRegenQr(roomId) {
    if (!confirm('Regenerate QR? The old link will stop working immediately.')) return;
    setRegenId(roomId);
    try {
      const updated = await adminApi.regenQr(token, roomId);
      setRooms((r) => r.map((rm) => rm.id === roomId ? updated : rm));
    } catch (e) {
      alert(e.message);
    } finally {
      setRegenId(null);
    }
  }

  async function toggleActive(room) {
    const updated = await adminApi.updateRoom(token, room.id, { isActive: !room.isActive });
    setRooms((r) => r.map((rm) => rm.id === room.id ? updated : rm));
  }

  const filtered = rooms.filter((r) =>
    r.roomNumber.toString().toLowerCase().includes(search.toLowerCase()) ||
    (r.roomType || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-background">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="px-8 py-8 space-y-8 max-w-5xl bg-background min-h-screen text-on-surface font-body">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex gap-2 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-label">
            <span>Admin</span>
            <span className="opacity-30">/</span>
            <span className="text-primary font-bold">Rooms</span>
          </nav>
          <h1 className="font-serif text-4xl font-bold text-on-surface">Guest Chambers</h1>
          <p className="text-on-surface-variant text-sm mt-1">{rooms.length} rooms configured</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-gradient-to-tr from-primary to-primary-container text-on-primary px-5 py-3 rounded-xl font-label font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Accommodation
        </button>
      </div>

      {/* Create panel */}
      {showCreate && (
        <div className="bg-surface rounded-xl border border-outline-variant/20 shadow-[0_8px_32px_rgba(27,28,25,0.06)] overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant/10 flex justify-between items-center">
            <h2 className="font-serif text-xl text-on-surface">New Accommodation</h2>
            <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-6 grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-label">Room Number *</label>
              <input
                placeholder="e.g. 304"
                value={form.roomNumber}
                onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
                required
                className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary py-3 text-lg font-serif placeholder:text-outline-variant/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-label">Floor</label>
              <input
                type="number"
                placeholder="3"
                value={form.floor}
                onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary py-3 text-lg font-serif placeholder:text-outline-variant/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-label">Category</label>
              <select
                value={form.roomType}
                onChange={(e) => setForm((f) => ({ ...f, roomType: e.target.value }))}
                className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary py-3 text-on-surface focus:outline-none transition-colors"
              >
                {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-3 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 bg-gradient-to-tr from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-label font-bold text-sm tracking-wide disabled:opacity-60"
              >
                {creating ? <Spinner size="sm" /> : (
                  <><span className="material-symbols-outlined text-sm">add</span> Create Room</>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-6 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-label font-bold text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(27,28,25,0.03)] border border-outline-variant/10 overflow-hidden">
        {/* Search bar */}
        <div className="p-5 border-b border-outline-variant/10 bg-surface-container-low/30">
          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by room or type..."
              className="w-full pl-10 pr-4 py-2 bg-transparent border-b border-outline-variant/40 focus:border-primary focus:outline-none text-sm placeholder:text-on-surface-variant/50 transition-colors"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {['Room', 'Category', 'QR Token', 'Status', 'Actions'].map((h, i) => (
                <th key={h} className={`px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70 border-b border-outline-variant/10 font-label ${i === 4 ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {filtered.map((room) => (
              <tr key={room.id} className="hover:bg-surface-container-low/20 transition-colors group">
                <td className="px-6 py-5">
                  <span className="font-serif text-lg text-primary tracking-wide">{room.roomNumber}</span>
                  {room.floor && <span className="text-[10px] text-on-surface-variant font-label ml-2 uppercase tracking-wider">Floor {room.floor}</span>}
                </td>
                <td className="px-6 py-5">
                  <div>
                    <span className="text-sm font-medium text-on-surface">{room.roomType || 'Standard'}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <code className="px-3 py-1.5 bg-secondary-container/30 text-on-secondary-container rounded-md font-mono text-xs font-bold border border-primary-container/20">
                    {room.qrToken}
                  </code>
                </td>
                <td className="px-6 py-5">
                  <button
                    onClick={() => toggleActive(room)}
                    className="flex items-center gap-2"
                  >
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${room.isActive ? 'bg-primary/20' : 'bg-outline-variant/30'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all ${room.isActive ? 'right-0.5 bg-primary' : 'left-0.5 bg-surface-container-highest'}`} />
                    </div>
                    <span className={`text-xs font-label font-bold uppercase tracking-wider ${room.isActive ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                      {room.isActive ? 'Available' : 'Inactive'}
                    </span>
                  </button>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={adminApi.downloadQrUrl(room.id)}
                      download={`room-${room.roomNumber}-qr.png`}
                      className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
                      title="Download QR"
                    >
                      <span className="material-symbols-outlined text-lg">download</span>
                    </a>
                    <button
                      onClick={() => handleRegenQr(room.id)}
                      disabled={regenId === room.id}
                      title="Regenerate QR token"
                      className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors disabled:opacity-50"
                    >
                      {regenId === room.id
                        ? <Spinner size="sm" />
                        : <span className="material-symbols-outlined text-lg">refresh</span>
                      }
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 bg-surface-container-low/30 border-t border-outline-variant/10">
          <span className="text-xs text-on-surface-variant font-label">
            Showing {filtered.length} of {rooms.length} accommodations
          </span>
        </div>
      </div>
    </div>
  );
}

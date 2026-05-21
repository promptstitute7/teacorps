'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { staffApi } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';

// ── Check-In Modal ────────────────────────────────────────────────────────────
function CheckInModal({ room, onClose, onSuccess }) {
  const { token } = useAuthStore();
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default checkout = tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCheckOutDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await staffApi.checkIn(token, {
        roomId: room.id,
        guestName,
        phone,
        checkOutDate,
      });
      onSuccess(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/15">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Check In Guest</p>
            <h2 className="text-lg font-serif font-bold text-primary">Room {room.roomNumber}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant block mb-1.5">Guest Name</label>
            <input
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="Full name"
              required
              className="w-full bg-background border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/60"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant block mb-1.5">Phone Number</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              type="tel"
              required
              className="w-full bg-background border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/60"
            />
            <p className="text-[10px] text-on-surface-variant/60 mt-1">Guest will use this to log in via QR</p>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant block mb-1.5">Check-Out Date</label>
            <input
              value={checkOutDate}
              onChange={e => setCheckOutDate(e.target.value)}
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-background border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/60"
            />
          </div>

          {error && (
            <p className="text-xs text-error bg-error-container/30 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ boxShadow: '0 4px 16px rgba(30,80,50,0.25)' }}>
            {loading ? <Spinner size="sm" /> : (
              <><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>Check In Guest</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Room Card ─────────────────────────────────────────────────────────────────
function RoomCard({ room, onCheckIn, onCheckOut }) {
  const reservation = room.reservations?.[0];
  const guest = reservation?.guest;
  const open = room.tickets?.filter(t => !['completed', 'cancelled'].includes(t.status)) || [];
  const hasEmergency = open.some(t => t.priority === 'emergency');
  const hasHigh = open.some(t => t.priority === 'high');
  const occupied = !!reservation;

  const borderColor = hasEmergency ? 'border-l-error'
    : hasHigh ? 'border-l-primary'
    : open.length > 0 ? 'border-l-secondary-fixed-dim'
    : occupied ? 'border-l-tertiary'
    : 'border-l-outline-variant/40';

  return (
    <div className={`bg-surface-container-lowest rounded-xl border border-outline-variant/15 border-l-4 ${borderColor} p-4 shadow-ambient space-y-3`}>
      <div className="flex items-start justify-between">
        <span className="font-serif text-lg font-bold text-primary">Room {room.roomNumber}</span>
        <div className="flex items-center gap-1.5">
          {hasEmergency && (
            <span className="flex items-center gap-1 text-[10px] font-label font-bold text-error uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_home</span>
              Emergency
            </span>
          )}
          {!hasEmergency && open.length > 0 && (
            <span className="text-[10px] font-label text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-md">
              {open.length} open
            </span>
          )}
          {!occupied && (
            <span className="text-[10px] font-label text-on-surface-variant/50 uppercase tracking-wider bg-surface-container px-2 py-0.5 rounded-md">Vacant</span>
          )}
          {occupied && open.length === 0 && (
            <span className="flex items-center gap-1 text-[10px] font-label text-tertiary">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              OK
            </span>
          )}
        </div>
      </div>

      {occupied && guest && (
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-on-surface">{guest.name}</p>
          <p className="text-xs text-on-surface-variant">{guest.phone}</p>
          {reservation.checkOutDate && (
            <p className="text-[10px] text-on-surface-variant/60">
              Checkout: {new Date(reservation.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>
      )}

      {open.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {open.slice(0, 3).map(t => (
            <span key={t.id} className="text-[10px] font-label bg-surface-container border border-outline-variant/20 rounded px-1.5 py-0.5 text-on-surface-variant">
              {t.category.replace('_', ' ')}
            </span>
          ))}
          {open.length > 3 && <span className="text-[10px] text-on-surface-variant/60">+{open.length - 3}</span>}
        </div>
      )}

      <div className="pt-1">
        {occupied ? (
          <button onClick={() => onCheckOut(reservation.id, room.roomNumber, guest?.name)}
            className="w-full py-2.5 rounded-lg border border-error/30 text-error text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-error-container/20 transition-colors active:scale-[0.98]">
            <span className="material-symbols-outlined text-[14px]">logout</span>
            Check Out
          </button>
        ) : (
          <button onClick={() => onCheckIn(room)}
            className="w-full py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/15 transition-colors active:scale-[0.98]">
            <span className="material-symbols-outlined text-[14px]">login</span>
            Check In Guest
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RoomsPage() {
  const { token } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInRoom, setCheckInRoom] = useState(null);
  const [checkOutConfirm, setCheckOutConfirm] = useState(null); // { reservationId, roomNumber, guestName }
  const [checkingOut, setCheckingOut] = useState(false);

  function loadRooms() {
    staffApi.getRooms(token).then(setRooms).catch(console.error).finally(() => setLoading(false));
  }

  useEffect(() => { if (token) loadRooms(); }, [token]);

  function handleCheckIn(room) { setCheckInRoom(room); }

  function handleCheckInSuccess() {
    setCheckInRoom(null);
    loadRooms();
  }

  function handleCheckOut(reservationId, roomNumber, guestName) {
    setCheckOutConfirm({ reservationId, roomNumber, guestName });
  }

  async function confirmCheckOut() {
    if (!checkOutConfirm) return;
    setCheckingOut(true);
    try {
      await staffApi.checkOut(token, checkOutConfirm.reservationId);
      setCheckOutConfirm(null);
      loadRooms();
    } catch (e) {
      alert(e.message);
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
  );

  const occupied = rooms.filter(r => r.reservations?.length > 0).length;
  const vacant = rooms.length - occupied;
  const floors = [...new Set(rooms.map(r => r.floor).filter(Boolean))].sort();
  const noFloor = rooms.filter(r => !r.floor);

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-6 bg-background text-on-surface">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-label">Live Overview</p>
          <h2 className="font-serif text-xl font-bold text-on-surface">Room Status</h2>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-label text-primary bg-primary/10 px-2.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {occupied} occupied
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-label text-on-surface-variant bg-surface-container px-2.5 py-1.5 rounded-full border border-outline-variant/20">
            {vacant} vacant
          </span>
        </div>
      </div>

      {floors.map(floor => (
        <div key={floor}>
          <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3">Floor {floor}</p>
          <div className="grid grid-cols-2 gap-3">
            {rooms.filter(r => r.floor === floor).map(room => (
              <RoomCard key={room.id} room={room} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
            ))}
          </div>
        </div>
      ))}

      {noFloor.length > 0 && (
        <div>
          {floors.length > 0 && <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3">Other</p>}
          <div className="grid grid-cols-2 gap-3">
            {noFloor.map(room => (
              <RoomCard key={room.id} room={room} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
            ))}
          </div>
        </div>
      )}

      {/* Check-in modal */}
      {checkInRoom && (
        <CheckInModal
          room={checkInRoom}
          onClose={() => setCheckInRoom(null)}
          onSuccess={handleCheckInSuccess}
        />
      )}

      {/* Check-out confirm modal */}
      {checkOutConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCheckOutConfirm(null)} />
          <div className="relative w-full max-w-sm bg-surface rounded-2xl shadow-xl p-6">
            <div className="w-12 h-12 rounded-full bg-error-container/30 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl text-error" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
            </div>
            <h3 className="text-base font-semibold text-on-surface text-center mb-1">Check Out Guest?</h3>
            <p className="text-sm text-on-surface-variant text-center mb-6">
              <strong>{checkOutConfirm.guestName}</strong> from Room {checkOutConfirm.roomNumber}.<br />
              Their portal access will end immediately.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCheckOutConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-outline-variant/40 text-on-surface-variant text-sm font-medium">
                Cancel
              </button>
              <button onClick={confirmCheckOut} disabled={checkingOut}
                className="flex-1 py-3 rounded-xl bg-error text-on-error text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {checkingOut ? <Spinner size="sm" /> : 'Check Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

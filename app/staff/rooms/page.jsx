'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { staffApi } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';

function getRoomStatus(room) {
  const open = room.tickets?.filter((t) => !['completed', 'cancelled'].includes(t.status)) || [];
  const guest = room.reservations?.[0]?.guest;
  const hasEmergency = open.some((t) => t.priority === 'emergency');
  const hasHigh = open.some((t) => t.priority === 'high');
  return { open, guest, hasEmergency, hasHigh };
}

function RoomCard({ room }) {
  const { open, guest, hasEmergency, hasHigh } = getRoomStatus(room);

  const borderColor = hasEmergency
    ? 'border-l-error'
    : hasHigh
    ? 'border-l-primary'
    : open.length > 0
    ? 'border-l-secondary-fixed-dim'
    : 'border-l-tertiary';

  return (
    <div className={`bg-surface-container-lowest rounded-xl border border-outline-variant/15 border-l-4 ${borderColor} p-4 shadow-ambient space-y-2`}>
      <div className="flex items-start justify-between">
        <span className="font-serif text-lg font-bold text-primary">
          {room.roomNumber}
        </span>
        <div>
          {hasEmergency && (
            <span className="flex items-center gap-1 text-[10px] font-label font-bold text-error uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_home</span>
              Emergency
            </span>
          )}
          {!hasEmergency && hasHigh && (
            <span className="flex items-center gap-1 text-[10px] font-label font-bold text-primary uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">warning</span>
              High
            </span>
          )}
          {!hasEmergency && !hasHigh && open.length > 0 && (
            <span className="text-[10px] font-label text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-md">
              {open.length} open
            </span>
          )}
          {open.length === 0 && guest && (
            <span className="flex items-center gap-1 text-[10px] font-label text-tertiary">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              OK
            </span>
          )}
          {!guest && (
            <span className="text-[10px] font-label text-on-surface-variant/50 uppercase tracking-wider">Vacant</span>
          )}
        </div>
      </div>

      {guest && (
        <p className="text-xs text-on-surface-variant truncate">{guest.name}</p>
      )}
      {room.roomType && (
        <p className="text-[10px] text-on-surface-variant/60 font-label uppercase tracking-wider">{room.roomType}</p>
      )}

      {open.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {open.slice(0, 3).map((t) => (
            <span key={t.id}
              className="text-[10px] font-label bg-surface-container border border-outline-variant/20 rounded px-1.5 py-0.5 text-on-surface-variant">
              {t.category.replace('_', ' ')}
            </span>
          ))}
          {open.length > 3 && (
            <span className="text-[10px] text-on-surface-variant/60">+{open.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function RoomsGridPage() {
  const { token } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    staffApi.getRooms(token).then((data) => {
      setRooms(data);
      setLoading(false);
    });
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const floors = [...new Set(rooms.map((r) => r.floor).filter(Boolean))].sort();
  const noFloor = rooms.filter((r) => !r.floor);

  const emergency = rooms.filter((r) => getRoomStatus(r).hasEmergency).length;
  const withIssues = rooms.filter((r) => getRoomStatus(r).open.length > 0).length;

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-6 bg-background text-on-surface">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-label">Live Overview</p>
          <h2 className="font-serif text-xl font-bold text-on-surface">Room Status</h2>
        </div>
        <div className="flex gap-2">
          {emergency > 0 && (
            <span className="flex items-center gap-1.5 text-[10px] font-label font-bold text-error bg-error-container px-2.5 py-1.5 rounded-full uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emergency_home</span>
              {emergency}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[10px] font-label text-on-surface-variant bg-surface-container px-2.5 py-1.5 rounded-full border border-outline-variant/20">
            <span className="material-symbols-outlined text-sm">confirmation_number</span>
            {withIssues} active
          </span>
        </div>
      </div>

      {floors.map((floor) => (
        <div key={floor}>
          <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3">
            Floor {floor}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {rooms.filter((r) => r.floor === floor).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      ))}

      {noFloor.length > 0 && (
        <div>
          <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3">Other</p>
          <div className="grid grid-cols-2 gap-3">
            {noFloor.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

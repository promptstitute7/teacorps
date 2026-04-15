'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGuestStore } from '@/store/guestStore';
import { guestApi } from '@/lib/api';
import { subscribeToGuestTickets, unsubscribe } from '@/lib/realtime';

export default function RoomLayout({ children }) {
  const params = useParams();
  const token = params.token;
  const { setRoom, updateTicketStatus } = useGuestStore();

  useEffect(() => {
    let channel = null;

    guestApi.getRoom(token)
      .then(({ room, reservation }) => {
        setRoom(room, reservation);
        // Subscribe to ticket updates for this specific room
        channel = subscribeToGuestTickets(room.id, {
          onUpdate: (ticket) => updateTicketStatus(ticket.id, ticket.status),
        });
      })
      .catch(console.error);

    return () => unsubscribe(channel);
  }, [token]);

  return <>{children}</>;
}

'use client';
import { io } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

let guestSocket = null;
let staffSocket = null;

export function connectGuestSocket(roomToken) {
  if (guestSocket) guestSocket.disconnect();
  guestSocket = io(WS_URL, {
    auth: { roomToken },
    reconnection: true,
    reconnectionDelay: 1000,
  });
  return guestSocket;
}

export function connectStaffSocket(token) {
  if (staffSocket) staffSocket.disconnect();
  staffSocket = io(WS_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
  });
  return staffSocket;
}

export function disconnectGuestSocket() {
  guestSocket?.disconnect();
  guestSocket = null;
}

export function disconnectStaffSocket() {
  staffSocket?.disconnect();
  staffSocket = null;
}

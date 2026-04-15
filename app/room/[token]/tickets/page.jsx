'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { guestApi } from '@/lib/api';
import { useGuestStore } from '@/store/guestStore';
import Spinner from '@/components/ui/Spinner';
import { timeAgo, formatTime, STATUS_LABELS, CATEGORY_LABELS } from '@/lib/utils';
import Link from 'next/link';

const CAT_ICONS = {
  room_service: 'room_service', housekeeping: 'cleaning_services',
  maintenance: 'build', front_desk: 'luggage', emergency: 'emergency_home',
};


function GuestNav({ token, active }) {
  const items = [
    { key: 'home',      icon: 'home',                label: 'Home',      href: `/room/${token}` },
    { key: 'services',  icon: 'room_service',         label: 'Services',  href: `/room/${token}/service` },
    { key: 'concierge', icon: 'smart_toy',            label: 'Concierge', href: `/room/${token}/concierge` },
    { key: 'tickets',   icon: 'confirmation_number',  label: 'Requests',  href: `/room/${token}/tickets` },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl border-t border-outline-variant/15 shadow-ambient-up">
      <div className="flex justify-around items-center pt-3 pb-6">
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <Link key={item.key} href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary -translate-y-0.5' : 'text-on-surface-variant/60'}`}>
              <span className="material-symbols-outlined text-2xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className={`text-[10px] uppercase tracking-widest font-label ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function MyTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const { tickets, setTickets } = useGuestStore();

  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [rating, setRating] = useState({});
  const [ratingSubmitted, setRatingSubmitted] = useState({});

  useEffect(() => {
    guestApi.getRoomTickets(token).then((data) => {
      setTickets(data);
      setLoading(false);
    });
  }, [token]);

  async function submitRating(ticketId, stars) {
    try {
      await guestApi.rateTicket(ticketId, stars);
      setRatingSubmitted((r) => ({ ...r, [ticketId]: stars }));
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleEscalate(ticketId) {
    try {
      await guestApi.escalateTicket(ticketId);
      setTickets(tickets.map((t) => t.id === ticketId ? { ...t, status: 'escalated' } : t));
    } catch (e) {
      alert(e.message);
    }
  }

  const slaExceeded = (ticket) =>
    ticket.slaDeadline &&
    new Date() > new Date(ticket.slaDeadline) &&
    ['new', 'acknowledged'].includes(ticket.status);

  function statusColor(status) {
    switch (status) {
      case 'completed':   return 'text-tertiary bg-tertiary-fixed';
      case 'escalated':   return 'text-error bg-error-container';
      case 'in_progress': return 'text-on-secondary-container bg-secondary-container';
      case 'cancelled':   return 'text-on-surface-variant bg-surface-container-high';
      default:            return 'text-primary bg-primary-container/40';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center gap-4 px-6 py-4">
          <button onClick={() => router.back()} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-label">Your Requests</p>
            <h1 className="font-serif text-xl font-bold text-primary leading-tight">
              {tickets.length} {tickets.length === 1 ? 'Request' : 'Requests'}
            </h1>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl block mb-3">confirmation_number</span>
            <p className="text-on-surface-variant text-sm mb-4">No requests yet.</p>
            <button
              onClick={() => router.push(`/room/${token}`)}
              className="text-primary font-label font-bold text-sm uppercase tracking-widest underline underline-offset-4"
            >
              Browse Services
            </button>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`bg-surface-container-lowest rounded-xl border shadow-ambient overflow-hidden transition-all ${
                ticket.status === 'escalated' ? 'border-error/30' :
                ticket.status === 'completed' ? 'border-outline-variant/10' :
                'border-outline-variant/15'
              }`}
            >
              {/* Card header */}
              <button
                className="w-full px-4 py-4 flex items-center gap-3 text-left"
                onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    {CAT_ICONS[ticket.category] || 'confirmation_number'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif text-sm font-bold text-on-surface">
                      {CATEGORY_LABELS[ticket.category]}
                    </span>
                    <span className={`text-[10px] font-label font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${statusColor(ticket.status)}`}>
                      {STATUS_LABELS[ticket.status]}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant/70 mt-0.5 font-label">
                    #{ticket.ticketNumber} · {timeAgo(ticket.createdAt)}
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">
                  {expanded === ticket.id ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Expanded */}
              {expanded === ticket.id && (
                <div className="px-4 pb-4 space-y-4 border-t border-outline-variant/10 pt-4">
                  {ticket.subcategory && (
                    <p className="text-sm text-on-surface font-medium">{ticket.subcategory}</p>
                  )}
                  {ticket.description && (
                    <p className="text-xs text-on-surface-variant italic">"{ticket.description}"</p>
                  )}

                  {/* Timeline */}
                  {ticket.events && ticket.events.length > 0 && (
                    <div className="space-y-2.5">
                      {ticket.events.map((e) => (
                        <div key={e.id} className="flex items-start gap-3 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-container mt-1.5 shrink-0" />
                          <div className="text-on-surface-variant">
                            <span className="text-outline">{formatTime(e.createdAt)}</span>
                            <span className="ml-2">
                              {e.eventType === 'created' && 'Ticket created'}
                              {e.eventType === 'acknowledged' && 'Acknowledged by staff'}
                              {e.eventType === 'assigned' && 'Assigned to staff member'}
                              {e.eventType === 'status_changed' && `Status: ${STATUS_LABELS[e.newValue] || e.newValue}`}
                              {e.eventType === 'completed' && 'Service completed'}
                              {e.eventType === 'escalated' && 'Escalated to manager'}
                              {e.eventType === 'rated' && `Rated ${e.newValue} stars`}
                              {e.note && ` — ${e.note}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SLA warning */}
                  {slaExceeded(ticket) && (
                    <div className="flex items-start gap-3 p-3 bg-error/5 border border-error/20 rounded-xl">
                      <span className="material-symbols-outlined text-error text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                      <div className="flex-1">
                        <p className="text-sm text-error font-label font-bold mb-2">Still waiting? We're sorry.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEscalate(ticket.id)}
                            className="px-3 py-1.5 rounded-full bg-error text-on-error text-xs font-label font-bold uppercase tracking-wider"
                          >
                            Escalate Now
                          </button>
                          <a href={`tel:${process.env.NEXT_PUBLIC_HOTEL_PHONE || '+91XXXXXXXXXX'}`}>
                            <button className="px-3 py-1.5 rounded-full border border-outline-variant/30 text-on-surface text-xs font-label font-bold uppercase tracking-wider">
                              Call Reception
                            </button>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  {ticket.status === 'completed' && !ticket.guestRating && !ratingSubmitted[ticket.id] && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">How was the service?</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => {
                              setRating((r) => ({ ...r, [ticket.id]: star }));
                              submitRating(ticket.id, star);
                            }}
                            className="transition-transform hover:scale-110 active:scale-95"
                          >
                            <span className="material-symbols-outlined text-2xl"
                              style={{
                                color: (rating[ticket.id] || 0) >= star ? '#d4a855' : '#d2c5b2',
                                fontVariationSettings: (rating[ticket.id] || 0) >= star ? "'FILL' 1" : "'FILL' 0",
                              }}>
                              star
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(ticket.guestRating || ratingSubmitted[ticket.id]) && (
                    <div className="flex items-center gap-2 text-sm text-primary font-label">
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1", color: '#d4a855' }}>star</span>
                      You rated this {ticket.guestRating || ratingSubmitted[ticket.id]}/5
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </main>

      <GuestNav token={token} active="tickets" />
    </div>
  );
}

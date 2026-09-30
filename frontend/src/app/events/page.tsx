'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { EventItem } from '../../types';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import {
  Calendar,
  Users,
  MapPin,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react';

export default function EventsListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadEvents();
    }
  }, [user, authLoading, router]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this event and its tasks, vendors, and risks?')) {
      return;
    }
    try {
      await api.deleteEvent(eventId);
      loadEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center text-xs text-[#5A5A5A]">
        Verifying session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Page Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-headline font-bold text-[#1F3A32] tracking-tight">
              Event Operations Portfolio
            </h1>
            <p className="text-xs text-[#5A5A5A] mt-1">
              Select an event to access its AI assistant, tasks, vendor commitments, and active risk radar.
            </p>
          </div>

          <Link
            href="/events/new"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1F3A32] hover:bg-[#172C26] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Event</span>
          </Link>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-[#8A8A8A]">
            Loading your events...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E8E0D0] max-w-md w-full mx-auto p-8 sm:p-10 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8E0D0] flex items-center justify-center mx-auto mb-3.5 text-[#1F3A32]">
              <Calendar className="w-6 h-6 text-[#1F3A32]" />
            </div>
            <h3 className="text-base font-headline font-bold text-[#1F3A32] mb-1">
              No Events Planned Yet
            </h3>
            <p className="text-xs text-[#5A5A5A]">
              Create your first event to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const start = new Date(ev.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const end = new Date(ev.endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={ev._id}
                  className="bg-white rounded-xl border border-[#E8E0D0] hover:border-[#C8A96B] transition-all shadow-xs hover:shadow-md p-5 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <Badge variant="forest">{ev.type}</Badge>
                      <div className="flex items-center space-x-1.5">
                        <Badge
                          variant={ev.status === 'COMPLETED' ? 'success' : 'sage'}
                          size="sm"
                        >
                          {ev.status}
                        </Badge>
                        <button
                          onClick={(e) => handleDeleteEvent(e, ev._id)}
                          title="Delete Event"
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#8A8A8A] hover:text-rose-700 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-headline font-bold text-[#1F3A32] mb-1.5 leading-snug">
                      {ev.name}
                    </h3>

                    {ev.description && (
                      <p className="text-xs text-[#5A5A5A] line-clamp-2 mb-3">
                        {ev.description}
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-[#5A5A5A] pt-2 border-t border-[#E8E0D0]/60">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-[#C8A96B]" />
                        <span>
                          {start} – {end}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Users className="w-3.5 h-3.5 text-[#1F3A32]" />
                        <span>{ev.guestCount} Expected Attendees</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-[#A8B5A0]" />
                        <span>{ev.location}</span>
                      </div>
                    </div>

                    {ev.activities && ev.activities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-[#E8E0D0]/60">
                        {ev.activities.slice(0, 3).map((act, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-[#FAF7F2] text-[#1F3A32] px-2 py-0.5 rounded border border-[#E8E0D0]"
                          >
                            {act}
                          </span>
                        ))}
                        {ev.activities.length > 3 && (
                          <span className="text-[10px] text-[#8A8A8A] self-center">
                            +{ev.activities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E8E0D0]">
                    <Link
                      href={`/events/${ev._id}`}
                      className="w-full py-2 bg-[#FAF7F2] group-hover:bg-[#1F3A32] text-[#1F3A32] group-hover:text-white border border-[#E8E0D0] group-hover:border-[#1F3A32] rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 shadow-2xs"
                    >
                      <span>Open Operations Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { Header } from '../../../components/common/Header';
import { Calendar, Users, MapPin, Tag, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState('Wedding');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guestCount, setGuestCount] = useState('400');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [activitiesInput, setActivitiesInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate || !location.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const activities = activitiesInput
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const event = await api.createEvent({
        name: name.trim(),
        type,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        guestCount: parseInt(guestCount, 10) || 0,
        location: location.trim(),
        description: description.trim() || undefined,
        activities,
      });

      router.push(`/events/${event._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create event.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/events"
            className="text-xs font-semibold text-[#1F3A32] hover:text-[#172C26] flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Events</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E0D0] p-6 sm:p-8 shadow-xs">
          <div className="mb-6">
            <h1 className="text-xl font-headline font-bold text-[#1F3A32]">
              Create New Event
            </h1>
            <p className="text-xs text-[#5A5A5A] mt-1">
              Initialize event parameters. Once created, you can use the AI operations assistant to orchestrate tasks and identify risks.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#202020] mb-1">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul & Priya Wedding"
                className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#202020] mb-1">
                  Event Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Corporate Outing">Corporate Outing</option>
                  <option value="Conference">Conference</option>
                  <option value="Gala Dinner">Gala Dinner</option>
                  <option value="Social Gathering">Social Gathering</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#202020] mb-1">
                  Expected Attendees / Guests *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  placeholder="400"
                  className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#202020] mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202020] mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#202020] mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kolkata, West Bengal"
                className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#202020] mb-1">
                Key Activities / Sub-events (Comma-separated)
              </label>
              <input
                type="text"
                value={activitiesInput}
                onChange={(e) => setActivitiesInput(e.target.value)}
                placeholder="Sangeet, Haldi, Wedding Ceremony, Reception"
                className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
              />
              <span className="text-[10px] text-[#8A8A8A] block mt-1">
                Used by the AI to tag vendors and detect activity-specific coverage gaps.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#202020] mb-1">
                Description / Planning Notes
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High-level themes, guest demographics, budget constraints..."
                className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E8E0D0]">
              <Link
                href="/events"
                className="px-4 py-2 text-[#5A5A5A] hover:text-[#202020] font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#1F3A32] hover:bg-[#172C26] text-white font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <span>{loading ? 'Initializing Event...' : 'Create & Launch Dashboard'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

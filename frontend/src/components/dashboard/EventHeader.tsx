'use client';

import React, { useState } from 'react';
import { EventItem } from '../../types';
import { api } from '../../lib/api';
import {
  Calendar,
  Users,
  MapPin,
  Tag,
  Clock,
  Sparkles,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface EventHeaderProps {
  event: EventItem;
  onEventUpdated: () => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  event,
  onEventUpdated,
}) => {
  const [editingGuestCount, setEditingGuestCount] = useState(false);
  const [guestCountInput, setGuestCountInput] = useState(
    event.guestCount.toString()
  );
  const [saving, setSaving] = useState(false);

  const start = new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const end = new Date(event.endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const durationDays = Math.max(
    1,
    Math.round(
      (new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const handleSaveGuestCount = async () => {
    const val = parseInt(guestCountInput, 10);
    if (isNaN(val) || val < 0) return;

    setSaving(true);
    try {
      await api.updateEvent(event._id, { guestCount: val });
      setEditingGuestCount(false);
      onEventUpdated();
    } catch (err) {
      console.error('Failed to update guest count:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E0D0] p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title & Metadata */}
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <h1 className="text-2xl font-headline font-bold text-[#1F3A32] tracking-tight">
              {event.name}
            </h1>
            <Badge variant="forest">{event.type}</Badge>
            <Badge variant={event.status === 'COMPLETED' ? 'success' : 'sage'}>
              {event.status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#5A5A5A]">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-[#C8A96B]" />
              <span>
                {start} – {end}
              </span>
            </span>

            <span className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#A8B5A0]" />
              <span>{durationDays} Day{durationDays > 1 ? 's' : ''} Duration</span>
            </span>

            <span className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-[#C8A96B]" />
              <span>{event.location}</span>
            </span>

            {/* Editable Guest Count */}
            <div className="flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-[#1F3A32]" />
              {editingGuestCount ? (
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={guestCountInput}
                    onChange={(e) => setGuestCountInput(e.target.value)}
                    className="w-20 px-2 py-0.5 text-xs border border-[#1F3A32] rounded bg-[#FAF7F2] text-[#202020]"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveGuestCount}
                    disabled={saving}
                    className="p-1 rounded bg-[#1F3A32] text-white hover:bg-[#172C26]"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setGuestCountInput(event.guestCount.toString());
                      setEditingGuestCount(false);
                    }}
                    className="p-1 rounded bg-stone-200 text-stone-700 hover:bg-stone-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-[#1F3A32]">
                    {event.guestCount}
                  </span>
                  <span>Expected Attendees</span>
                  <button
                    onClick={() => setEditingGuestCount(true)}
                    title="Change guest count manually"
                    className="p-1 text-[#8A8A8A] hover:text-[#1F3A32] rounded hover:bg-[#FAF7F2]"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activities Tags */}
      {event.activities && event.activities.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-[#E8E0D0] flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#8A8A8A] flex items-center space-x-1 mr-1">
            <Tag className="w-3.5 h-3.5 text-[#A8B5A0]" />
            <span>Key Activities:</span>
          </span>
          {event.activities.map((activity, idx) => (
            <span
              key={idx}
              className="text-xs font-medium text-[#1F3A32] bg-[#FAF7F2] border border-[#E8E0D0] px-2.5 py-1 rounded-md"
            >
              {activity}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

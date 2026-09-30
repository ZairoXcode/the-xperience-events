'use client';

import React, { useState } from 'react';
import { DeadlineItem, DeadlineStatus } from '../../types';
import { api } from '../../lib/api';
import { Clock, Plus, Calendar, Check, Trash2, Bot } from 'lucide-react';
import { StatusBadge } from '../common/Badge';

interface DeadlinesPanelProps {
  eventId: string;
  deadlines: DeadlineItem[];
  onDeadlinesChanged: () => void;
}

export const DeadlinesPanel: React.FC<DeadlinesPanelProps> = ({
  eventId,
  deadlines,
  onDeadlinesChanged,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleStatusChange = async (
    deadlineId: string,
    newStatus: DeadlineStatus
  ) => {
    try {
      await api.updateDeadline(deadlineId, { status: newStatus });
      onDeadlinesChanged();
    } catch (err) {
      console.error('Failed to update deadline status:', err);
    }
  };

  const handleDelete = async (deadlineId: string) => {
    try {
      await api.deleteDeadline(deadlineId);
      onDeadlinesChanged();
    } catch (err) {
      console.error('Failed to delete deadline:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || creating) return;

    setCreating(true);
    try {
      await api.createDeadline(eventId, {
        title: title.trim(),
        dueDate: new Date(dueDate).toISOString(),
        description: description.trim() || undefined,
        status: 'UPCOMING',
      });
      setTitle('');
      setDueDate('');
      setDescription('');
      setShowAddModal(false);
      onDeadlinesChanged();
    } catch (err) {
      console.error('Failed to create deadline:', err);
    } finally {
      setCreating(false);
    }
  };

  const now = new Date();

  return (
    <div className="bg-white rounded-2xl border border-[#E8E0D0] shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E8E0D0] flex items-center justify-between bg-[#FAF7F2]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-[#1F3A32] flex items-center justify-center text-[#C8A96B]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-headline font-bold text-[#1F3A32]">
              Event Deadlines ({deadlines.length})
            </h3>
            <span className="text-[11px] text-[#5A5A5A]">
              Vendor submission cutoffs and relative dates
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-2.5 py-1 text-xs font-semibold bg-[#1F3A32] hover:bg-[#172C26] text-white rounded-md shadow-xs transition-colors flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Deadline</span>
        </button>
      </div>

      {/* Deadlines List */}
      <div className="divide-y divide-[#E8E0D0] max-h-[380px] overflow-y-auto">
        {deadlines.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#8A8A8A]">
            No deadlines scheduled yet. Say things like &ldquo;Catering needs final guest count one week before the wedding&rdquo; in chat.
          </div>
        ) : (
          deadlines.map((dl) => {
            const due = new Date(dl.dueDate);
            const diffDays = Math.ceil(
              (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            const isOverdue = dl.status === 'UPCOMING' && diffDays < 0;

            return (
              <div
                key={dl._id}
                className="p-3.5 hover:bg-[#FAF7F2]/60 transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#1F3A32]">
                      {dl.title}
                    </span>
                    <StatusBadge status={isOverdue ? 'OVERDUE' : dl.status} />
                    {dl.source === 'AI' && (
                      <span
                        title="Calculated from relative phrase by AI"
                        className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FAF7F2] text-[#6B5328] border border-[#C8A96B]/40"
                      >
                        <Bot className="w-2.5 h-2.5 mr-0.5 text-[#C8A96B]" /> Relative AI Date
                      </span>
                    )}
                  </div>

                  {dl.description && (
                    <p className="text-xs text-[#5A5A5A] mb-1">
                      {dl.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-3 text-[11px]">
                    <span className="flex items-center space-x-1 text-[#6B5328] font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {due.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </span>

                    {dl.status !== 'COMPLETED' && (
                      <span
                        className={`font-semibold ${
                          diffDays < 0
                            ? 'text-rose-700'
                            : diffDays <= 7
                            ? 'text-amber-800'
                            : 'text-[#5A5A5A]'
                        }`}
                      >
                        {diffDays < 0
                          ? `${Math.abs(diffDays)} days overdue`
                          : diffDays === 0
                          ? 'Due today!'
                          : `${diffDays} days remaining`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {dl.status !== 'COMPLETED' ? (
                    <button
                      onClick={() => handleStatusChange(dl._id, 'COMPLETED')}
                      className="px-2 py-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded flex items-center space-x-1 transition-colors"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Done</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(dl._id, 'UPCOMING')}
                      className="px-2 py-1 text-[10px] text-stone-500 hover:text-stone-700 underline"
                    >
                      Reopen
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(dl._id)}
                    className="opacity-0 group-hover:opacity-100 text-[#8A8A8A] hover:text-rose-700 p-1 rounded transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Deadline Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E8E0D0]">
            <h4 className="text-base font-headline font-bold text-[#1F3A32] mb-3">
              Schedule New Deadline
            </h4>
            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#5A5A5A] font-medium mb-1">
                  Deadline Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Finalize catering headcount"
                  className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                />
              </div>

              <div>
                <label className="block text-[#5A5A5A] font-medium mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                />
              </div>

              <div>
                <label className="block text-[#5A5A5A] font-medium mb-1">
                  Description / Context
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Vendor needs lock-in 7 days before event start"
                  className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-[#5A5A5A] hover:text-[#202020] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim() || !dueDate}
                  className="px-4 py-1.5 bg-[#1F3A32] text-white font-semibold rounded-lg shadow-sm hover:bg-[#172C26] transition-colors disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Add Deadline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

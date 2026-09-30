'use client';

import React, { useState } from 'react';
import { RequirementItem, RequirementStatus } from '../../types';
import { api } from '../../lib/api';
import { ClipboardList, Plus, Trash2, Bot, Layers } from 'lucide-react';
import { StatusBadge } from '../common/Badge';

interface RequirementsPanelProps {
  eventId: string;
  requirements: RequirementItem[];
  onRequirementsChanged: () => void;
}

export const RequirementsPanel: React.FC<RequirementsPanelProps> = ({
  eventId,
  requirements,
  onRequirementsChanged,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Accommodation');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const handleStatusChange = async (
    reqId: string,
    newStatus: RequirementStatus
  ) => {
    try {
      await api.updateRequirement(reqId, { status: newStatus });
      onRequirementsChanged();
    } catch (err) {
      console.error('Failed to update requirement status:', err);
    }
  };

  const handleDelete = async (reqId: string) => {
    try {
      await api.updateRequirement(reqId, {}); // or delete
      onRequirementsChanged();
    } catch (err) {
      console.error('Failed to delete requirement:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || creating) return;

    setCreating(true);
    try {
      await api.createRequirement(eventId, {
        title: title.trim(),
        category,
        quantity: quantity ? parseInt(quantity, 10) : undefined,
        notes: notes.trim() || undefined,
        status: 'PENDING',
      });
      setTitle('');
      setQuantity('');
      setNotes('');
      setShowAddModal(false);
      onRequirementsChanged();
    } catch (err) {
      console.error('Failed to create requirement:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E0D0] shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E8E0D0] flex items-center justify-between bg-[#FAF7F2]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-[#1F3A32] flex items-center justify-center text-white">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-headline font-bold text-[#1F3A32]">
              Event Requirements ({requirements.length})
            </h3>
            <span className="text-[11px] text-[#5A5A5A]">
              Logistics specifications and resource quotas
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-2.5 py-1 text-xs font-semibold bg-[#1F3A32] hover:bg-[#172C26] text-white rounded-md shadow-xs transition-colors flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Requirement</span>
        </button>
      </div>

      {/* Requirements List */}
      <div className="divide-y divide-[#E8E0D0] max-h-[380px] overflow-y-auto">
        {requirements.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#8A8A8A]">
            No requirements noted. State needs in conversation like &ldquo;Around 150 guests will be travelling from outside the city&rdquo;.
          </div>
        ) : (
          requirements.map((req) => (
            <div
              key={req._id}
              className="p-3.5 hover:bg-[#FAF7F2]/60 transition-colors flex items-start justify-between gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#1F3A32]">
                    {req.title}
                  </span>
                  <span className="text-[10px] font-semibold text-[#1F3A32] bg-[#FAF7F2] border border-[#E8E0D0] px-2 py-0.5 rounded">
                    {req.category}
                  </span>
                  {req.source === 'AI' && (
                    <span
                      title="Extracted from dialogue by AI"
                      className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FAF7F2] text-[#6B5328] border border-[#C8A96B]/40"
                    >
                      <Bot className="w-2.5 h-2.5 mr-0.5 text-[#C8A96B]" /> AI
                    </span>
                  )}
                </div>

                {req.notes && (
                  <p className="text-xs text-[#5A5A5A] mb-1">{req.notes}</p>
                )}

                {req.quantity !== undefined && (
                  <div className="text-[11px] font-semibold text-[#6B5328]">
                    Quota / Count: {req.quantity} units
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div className="flex items-center space-x-2">
                <select
                  value={req.status}
                  onChange={(e) =>
                    handleStatusChange(
                      req._id,
                      e.target.value as RequirementStatus
                    )
                  }
                  className={`text-[11px] font-semibold rounded px-2 py-1 border transition-colors cursor-pointer focus:outline-none ${
                    req.status === 'FULFILLED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : req.status === 'IN_PROGRESS'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="FULFILLED">Fulfilled</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Requirement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E8E0D0]">
            <h4 className="text-base font-headline font-bold text-[#1F3A32] mb-3">
              Add Event Requirement
            </h4>
            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#5A5A5A] font-medium mb-1">
                  Requirement Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. VIP Shuttle Fleet"
                  className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A5A5A] font-medium mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Accommodation, Catering"
                    className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                  />
                </div>
                <div>
                  <label className="block text-[#5A5A5A] font-medium mb-1">
                    Quantity / Capacity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5A5A5A] font-medium mb-1">
                  Logistics Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specific rooming rules, delivery timelines..."
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
                  disabled={creating || !title.trim()}
                  className="px-4 py-1.5 bg-[#1F3A32] text-white font-semibold rounded-lg shadow-sm hover:bg-[#172C26] transition-colors disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Add Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

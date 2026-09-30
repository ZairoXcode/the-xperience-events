'use client';

import React, { useState } from 'react';
import { VendorItem, VendorCategory, VendorStatus } from '../../types';
import { api } from '../../lib/api';
import {
  Store,
  Plus,
  Phone,
  Mail,
  User,
  Tag,
  Trash2,
  Bot,
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';

interface VendorsPanelProps {
  eventId: string;
  vendors: VendorItem[];
  onVendorsChanged: () => void;
}

const CATEGORIES: VendorCategory[] = [
  'Venue',
  'Catering',
  'Decoration',
  'Photography',
  'Entertainment',
  'Accommodation',
  'Transportation',
  'Invitations',
  'Other',
];

export const VendorsPanel: React.FC<VendorsPanelProps> = ({
  eventId,
  vendors,
  onVendorsChanged,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('Venue');
  const [status, setStatus] = useState<VendorStatus>('PENDING');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const handleStatusChange = async (vendorId: string, newStatus: VendorStatus) => {
    try {
      await api.updateVendor(vendorId, { status: newStatus });
      onVendorsChanged();
    } catch (err) {
      console.error('Failed to update vendor status:', err);
    }
  };

  const handleDelete = async (vendorId: string) => {
    try {
      await api.deleteVendor(vendorId);
      onVendorsChanged();
    } catch (err) {
      console.error('Failed to delete vendor:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || creating) return;

    setCreating(true);
    try {
      await api.createVendor(eventId, {
        name: name.trim(),
        category,
        status,
        notes: notes.trim() || undefined,
      });
      setName('');
      setNotes('');
      setShowAddModal(false);
      onVendorsChanged();
    } catch (err) {
      console.error('Failed to create vendor:', err);
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
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-headline font-bold text-[#1F3A32]">
              Vendors & Partners ({vendors.length})
            </h3>
            <span className="text-[11px] text-[#5A5A5A]">
              Service providers across categories
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-2.5 py-1 text-xs font-semibold bg-[#1F3A32] hover:bg-[#172C26] text-white rounded-md shadow-xs transition-colors flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Vendor Roster Cards */}
      <div className="divide-y divide-[#E8E0D0] max-h-[460px] overflow-y-auto">
        {vendors.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8A8A8A]">
            No vendors registered yet. Mention vendors in chat or add one above.
          </div>
        ) : (
          vendors.map((vendor) => (
            <div
              key={vendor._id}
              className="p-3.5 hover:bg-[#FAF7F2]/60 transition-colors flex items-start justify-between gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#1F3A32]">
                    {vendor.name}
                  </span>
                  <span className="text-[10px] font-semibold text-[#1F3A32] bg-[#FAF7F2] border border-[#E8E0D0] px-2 py-0.5 rounded">
                    {vendor.category}
                  </span>
                  {vendor.source === 'AI' && (
                    <span
                      title="Added via AI conversation"
                      className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FAF7F2] text-[#6B5328] border border-[#C8A96B]/40"
                    >
                      <Bot className="w-2.5 h-2.5 mr-0.5 text-[#C8A96B]" /> AI
                    </span>
                  )}
                </div>

                {vendor.notes && (
                  <p className="text-xs text-[#5A5A5A] line-clamp-2 mt-0.5">
                    {vendor.notes}
                  </p>
                )}

                {vendor.relatedActivities &&
                  vendor.relatedActivities.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-[#8A8A8A]">Activities:</span>
                      {vendor.relatedActivities.map((act, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium text-[#1F3A32] bg-[#E4EAE1] px-1.5 py-0.2 rounded"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              {/* Status Selector & Actions */}
              <div className="flex items-center space-x-2">
                <select
                  value={vendor.status}
                  onChange={(e) =>
                    handleStatusChange(vendor._id, e.target.value as VendorStatus)
                  }
                  className={`text-[11px] font-semibold rounded px-2 py-1 border transition-colors cursor-pointer focus:outline-none ${
                    vendor.status === 'CONFIRMED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : vendor.status === 'CONTACTED'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : vendor.status === 'UNAVAILABLE' || vendor.status === 'CANCELLED'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <button
                  onClick={() => handleDelete(vendor._id)}
                  title="Remove vendor"
                  className="opacity-0 group-hover:opacity-100 text-[#8A8A8A] hover:text-rose-700 p-1 rounded transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E8E0D0]">
            <h4 className="text-base font-headline font-bold text-[#1F3A32] mb-3">
              Add Event Vendor
            </h4>
            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#5A5A5A] font-medium mb-1">
                  Vendor / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Blooms Floral Design"
                  className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A5A5A] font-medium mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VendorCategory)}
                    className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#5A5A5A] font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VendorStatus)}
                    className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#5A5A5A] font-medium mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Capacity, quote details, point of contact..."
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
                  disabled={creating || !name.trim()}
                  className="px-4 py-1.5 bg-[#1F3A32] text-white font-semibold rounded-lg shadow-sm hover:bg-[#172C26] transition-colors disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

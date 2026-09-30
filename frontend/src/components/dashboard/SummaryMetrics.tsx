import React from 'react';
import { EventDashboardSummary } from '../../types';
import {
  CheckSquare,
  AlertTriangle,
  Store,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface SummaryMetricsProps {
  summary: EventDashboardSummary;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ summary }) => {
  const { tasks, risks, vendors, deadlines } = summary;

  const taskCompletionRate =
    tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Tasks Summary Card */}
      <div className="bg-white rounded-2xl border border-[#E8E0D0] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#5A5A5A]">Tasks Progress</span>
          <div className="w-8 h-8 rounded-lg bg-[#E4EAE1] flex items-center justify-center text-[#1F3A32]">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-headline font-bold text-[#1F3A32]">
            {tasks.completed}/{tasks.total}
          </span>
          <span className="text-xs font-semibold text-[#6B5328]">
            ({taskCompletionRate}%)
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-[#FAF7F2] rounded-full h-1.5 mt-3 overflow-hidden border border-[#E8E0D0]">
          <div
            className="bg-[#1F3A32] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${taskCompletionRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#8A8A8A] mt-2.5">
          <span>{tasks.todo} To Do</span>
          <span>{tasks.inProgress} Active</span>
          {tasks.blocked > 0 && (
            <span className="text-rose-700 font-semibold">{tasks.blocked} Blocked</span>
          )}
        </div>
      </div>

      {/* 2. Active Risks Card */}
      <div
        className={`bg-white rounded-2xl border p-5 shadow-xs transition-colors ${
          risks.open > 0
            ? 'border-amber-300 bg-amber-50/20'
            : 'border-[#E8E0D0]'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#5A5A5A]">Operational Risks</span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              risks.open > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-[#E4EAE1] text-[#1F3A32]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span
            className={`text-2xl font-headline font-bold ${
              risks.open > 0 ? 'text-amber-900' : 'text-[#1F3A32]'
            }`}
          >
            {risks.open}
          </span>
          <span className="text-xs text-[#5A5A5A]">Open Risks</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] mt-4 pt-1.5 border-t border-[#E8E0D0]/60">
          {risks.critical > 0 && (
            <span className="text-rose-700 font-semibold">
              {risks.critical} Critical
            </span>
          )}
          {risks.high > 0 && (
            <span className="text-amber-800 font-medium">
              {risks.high} High
            </span>
          )}
          {risks.open === 0 && (
            <span className="text-emerald-700 font-medium">
              No active operational bottlenecks
            </span>
          )}
        </div>
      </div>

      {/* 3. Vendor Roster Card */}
      <div className="bg-white rounded-2xl border border-[#E8E0D0] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#5A5A5A]">Vendors Managed</span>
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8E0D0] flex items-center justify-center text-[#1F3A32]">
            <Store className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-headline font-bold text-[#1F3A32]">
            {vendors.confirmed}
          </span>
          <span className="text-xs text-[#5A5A5A]">
            of {vendors.total} Confirmed
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#8A8A8A] mt-4 pt-1.5 border-t border-[#E8E0D0]/60">
          <span>{vendors.pending} Pending</span>
          <span>{vendors.contacted} Contacted</span>
          {vendors.unavailable > 0 && (
            <span className="text-rose-700 font-medium">
              {vendors.unavailable} Unavailable
            </span>
          )}
        </div>
      </div>

      {/* 4. Deadlines Card */}
      <div className="bg-white rounded-2xl border border-[#E8E0D0] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#5A5A5A]">Upcoming Deadlines</span>
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8E0D0] flex items-center justify-center text-[#C8A96B]">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-headline font-bold text-[#1F3A32]">
            {deadlines.upcoming}
          </span>
          <span className="text-xs text-[#5A5A5A]">Pending Dates</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#8A8A8A] mt-4 pt-1.5 border-t border-[#E8E0D0]/60">
          <span>{deadlines.total} Total Deadlines</span>
          {deadlines.overdue > 0 ? (
            <span className="text-rose-700 font-semibold">
              {deadlines.overdue} Overdue
            </span>
          ) : (
            <span className="text-emerald-700 font-medium">Schedule on Track</span>
          )}
        </div>
      </div>
    </div>
  );
};

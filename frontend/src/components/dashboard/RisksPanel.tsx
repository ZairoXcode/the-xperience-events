'use client';

import React, { useState } from 'react';
import { RiskItem, RiskStatus } from '../../types';
import { api } from '../../lib/api';
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SeverityBadge, StatusBadge } from '../common/Badge';

interface RisksPanelProps {
  risks: RiskItem[];
  onRisksChanged: () => void;
}

export const RisksPanel: React.FC<RisksPanelProps> = ({
  risks,
  onRisksChanged,
}) => {
  const [filter, setFilter] = useState<'OPEN' | 'ALL'>('OPEN');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (riskId: string, newStatus: RiskStatus) => {
    setUpdatingId(riskId);
    try {
      await api.updateRiskStatus(riskId, newStatus);
      onRisksChanged();
    } catch (err) {
      console.error('Failed to update risk status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const visibleRisks = risks.filter((r) => {
    if (filter === 'OPEN') return r.status !== 'RESOLVED';
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#E8E0D0] shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E8E0D0] flex items-center justify-between bg-[#FAF7F2]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-100 flex items-center justify-center text-amber-800">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-headline font-bold text-[#1F3A32]">
              Risk & Issue Alerts ({risks.filter((r) => r.status === 'OPEN').length} Open)
            </h3>
            <span className="text-[11px] text-[#5A5A5A]">
              Operational bottlenecks and vendor gaps
            </span>
          </div>
        </div>

        <div className="flex rounded-md border border-[#E8E0D0] bg-white p-0.5 text-xs">
          <button
            onClick={() => setFilter('OPEN')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              filter === 'OPEN'
                ? 'bg-[#1F3A32] text-white'
                : 'text-[#5A5A5A] hover:text-[#1F3A32]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-[#1F3A32] text-white'
                : 'text-[#5A5A5A] hover:text-[#1F3A32]'
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {/* Risks List */}
      <div className="divide-y divide-[#E8E0D0] max-h-[460px] overflow-y-auto">
        {visibleRisks.length === 0 ? (
          <div className="py-10 text-center text-xs text-emerald-800 bg-emerald-50/30 flex flex-col items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600 mb-1.5" />
            <span className="font-semibold text-emerald-900">
              No open operational risks
            </span>
            <span className="text-[11px] text-emerald-700 mt-0.5">
              The AI assistant will alert you here if vendor conflicts or capacity shortages arise.
            </span>
          </div>
        ) : (
          visibleRisks.map((risk) => (
            <div
              key={risk._id}
              className={`p-4 transition-colors ${
                risk.status === 'RESOLVED'
                  ? 'bg-stone-50/50 opacity-70'
                  : risk.severity === 'CRITICAL' || risk.severity === 'HIGH'
                  ? 'bg-amber-50/20 hover:bg-amber-50/40'
                  : 'hover:bg-[#FAF7F2]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#1F3A32]">
                      {risk.title}
                    </span>
                    <SeverityBadge severity={risk.severity} />
                    <StatusBadge status={risk.status} />
                    {risk.affectedArea && (
                      <span className="text-[10px] font-semibold text-[#1F3A32] bg-[#E4EAE1] px-2 py-0.5 rounded">
                        Area: {risk.affectedArea}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5A5A5A] leading-relaxed mt-1">
                    {risk.description}
                  </p>
                </div>
              </div>

              {/* Actionable Recommendation */}
              {risk.suggestedAction && (
                <div className="mt-2.5 p-2 rounded-lg bg-[#FAF7F2] border border-[#E8E0D0] text-[11px] text-[#202020] flex items-start space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C8A96B] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#6B5328]">
                      Suggested Action:{' '}
                    </span>
                    <span>{risk.suggestedAction}</span>
                  </div>
                </div>
              )}

              {/* Source Dialogue Context */}
              {risk.sourceConversation && (
                <div className="text-[10px] text-[#8A8A8A] italic mt-1.5">
                  &ldquo;{risk.sourceConversation}&rdquo;
                </div>
              )}

              {/* Resolution Controls */}
              {risk.status !== 'RESOLVED' && (
                <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-[#E8E0D0]/60">
                  {risk.status === 'OPEN' && (
                    <button
                      disabled={updatingId === risk._id}
                      onClick={() =>
                        handleUpdateStatus(risk._id, 'ACKNOWLEDGED')
                      }
                      className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-stone-50 border border-stone-300 rounded text-stone-700 transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                  <button
                    disabled={updatingId === risk._id}
                    onClick={() => handleUpdateStatus(risk._id, 'RESOLVED')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Mark as Resolved</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

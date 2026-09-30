'use client';

import React from 'react';
import { ActivityItem } from '../../types';
import {
  History,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Users,
  Store,
  FileText,
  Activity,
} from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getIcon = (type: string, description: string) => {
    if (description.includes('⚠') || type === 'RISK') {
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
    }
    if (type === 'DEADLINE') {
      return <Calendar className="w-3.5 h-3.5 text-[#C8A96B]" />;
    }
    if (type === 'VENDOR') {
      return <Store className="w-3.5 h-3.5 text-[#1F3A32]" />;
    }
    if (type === 'TASK') {
      return <CheckCircle className="w-3.5 h-3.5 text-[#A8B5A0]" />;
    }
    if (description.includes('Guest count')) {
      return <Users className="w-3.5 h-3.5 text-[#1F3A32]" />;
    }
    return <FileText className="w-3.5 h-3.5 text-[#5A5A5A]" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E0D0] shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E8E0D0] flex items-center justify-between bg-[#FAF7F2]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-[#1F3A32] flex items-center justify-center text-white">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-headline font-bold text-[#1F3A32]">
              Activity History
            </h3>
            <span className="text-[11px] text-[#5A5A5A]">
              Recent event modifications and log entries
            </span>
          </div>
        </div>
      </div>

      {/* Timeline items */}
      <div className="p-4 max-h-[380px] overflow-y-auto space-y-3">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A8A8A]">
            No recent activity recorded yet.
          </div>
        ) : (
          activities.map((act) => (
            <div key={act._id} className="flex items-start space-x-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#E8E0D0] flex items-center justify-center flex-shrink-0 mt-0.5">
                {getIcon(act.type, act.description)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#202020] font-medium leading-tight">
                  {act.description}
                </p>
                <span className="text-[10px] text-[#8A8A8A] block mt-0.5">
                  {new Date(act.createdAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

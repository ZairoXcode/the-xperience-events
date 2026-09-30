'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import {
  EventItem,
  TaskItem,
  VendorItem,
  DeadlineItem,
  RequirementItem,
  RiskItem,
  ActivityItem,
  EventDashboardSummary,
} from '../../../types';

import { Header } from '../../../components/common/Header';
import { EventHeader } from '../../../components/dashboard/EventHeader';
import { SummaryMetrics } from '../../../components/dashboard/SummaryMetrics';
import { ChatPanel } from '../../../components/chat/ChatPanel';
import { TasksPanel } from '../../../components/dashboard/TasksPanel';
import { RisksPanel } from '../../../components/dashboard/RisksPanel';
import { VendorsPanel } from '../../../components/dashboard/VendorsPanel';
import { DeadlinesPanel } from '../../../components/dashboard/DeadlinesPanel';
import { RequirementsPanel } from '../../../components/dashboard/RequirementsPanel';
import { ActivityFeed } from '../../../components/dashboard/ActivityFeed';

import { Sparkles } from 'lucide-react';

export default function EventDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState<EventDashboardSummary | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const loadAllData = useCallback(async () => {
    if (!eventId) return;
    try {
      const [
        summaryData,
        tasksData,
        vendorsData,
        deadlinesData,
        requirementsData,
        risksData,
        activitiesData,
      ] = await Promise.all([
        api.getEventSummary(eventId),
        api.getTasks(eventId),
        api.getVendors(eventId),
        api.getDeadlines(eventId),
        api.getRequirements(eventId),
        api.getRisks(eventId),
        api.getActivities(eventId, 40),
      ]);

      setSummary(summaryData);
      setTasks(tasksData);
      setVendors(vendorsData);
      setDeadlines(deadlinesData);
      setRequirements(requirementsData);
      setRisks(risksData);
      setActivities(activitiesData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load event data:', err);
      setError(err.message || 'Failed to load event dashboard');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && eventId) {
      loadAllData();
    }
  }, [user, authLoading, eventId, router, loadAllData]);

  if (authLoading || (loading && !summary)) {
    return (
      <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center text-xs text-[#5A5A5A]">
        Loading event operations dashboard...
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-[#F5F0E6] flex flex-col">
        <Header />
        <div className="max-w-md mx-auto my-auto p-6 bg-white border border-[#E8E0D0] rounded-xl text-center shadow-xs">
          <h3 className="text-base font-headline font-bold text-rose-800 mb-2">
            Failed to Load Event
          </h3>
          <p className="text-xs text-[#5A5A5A] mb-4">
            {error || 'The requested event could not be found or access is restricted.'}
          </p>
          <button
            onClick={() => router.push('/events')}
            className="px-4 py-2 bg-[#1F3A32] text-white text-xs font-semibold rounded-lg"
          >
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col relative">
      <Header activeEventName={summary.event.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1">
        {/* Main Grid: Left Workspace (Event Info, Metrics & Panels) & Right Assistant from the TOP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
          {/* Left Column: Interactive Operations Dashboard Panels */}
          <div
            className={`${
              isChatOpen ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'
            } space-y-6 sm:space-y-7 transition-all duration-300`}
          >
            {/* 1. Event Overview Header */}
            <EventHeader event={summary.event} onEventUpdated={loadAllData} />

            {/* 2. Key Dashboard Summary Metrics */}
            <SummaryMetrics summary={summary} />

            {/* Collapsed Alert / Quick Restore Bar */}
            {!isChatOpen && (
              <div className="bg-[#FAF7F2] border border-[#E8E0D0] rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#1F3A32] flex items-center justify-center text-[#C8A96B]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#1F3A32]">
                      Assistant is hidden
                    </span>
                    <span className="text-[11px] text-[#8A8A8A] ml-2 hidden sm:inline">
                      • Reopen anytime to manage event updates
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="px-3.5 py-1.5 bg-[#1F3A32] hover:bg-[#172C26] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#C8A96B]" />
                  <span>Open Assistant</span>
                </button>
              </div>
            )}

            {/* Risks Panel */}
            <RisksPanel risks={risks} onRisksChanged={loadAllData} />

            {/* Tasks Panel */}
            <TasksPanel
              eventId={eventId}
              tasks={tasks}
              onTasksChanged={loadAllData}
            />

            {/* Deadlines Panel */}
            <DeadlinesPanel
              eventId={eventId}
              deadlines={deadlines}
              onDeadlinesChanged={loadAllData}
            />

            {/* Vendors Panel */}
            <VendorsPanel
              eventId={eventId}
              vendors={vendors}
              onVendorsChanged={loadAllData}
            />

            {/* Requirements Panel */}
            <RequirementsPanel
              eventId={eventId}
              requirements={requirements}
              onRequirementsChanged={loadAllData}
            />

            {/* Activity Feed */}
            <ActivityFeed activities={activities} />
          </div>

          {/* Right Column: Event Assistant starting right from the TOP */}
          {isChatOpen && (
            <div className="lg:col-span-5 xl:col-span-4 sticky top-20 transition-all duration-300">
              <ChatPanel
                eventId={eventId}
                eventType={summary.event.type}
                onEventUpdated={loadAllData}
                onCollapse={() => setIsChatOpen(false)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Floating Trigger Button when Collapsed */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5 px-4 py-3 bg-[#1F3A32] text-white rounded-full shadow-2xl hover:bg-[#172C26] transition-all hover:scale-105 border border-[#C8A96B]/50 group cursor-pointer"
          title="Open Event Assistant"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-[#C8A96B] flex items-center justify-center text-[#1F3A32]">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <span className="text-xs font-semibold tracking-wide pr-1">
            Assistant
          </span>
        </button>
      )}
    </div>
  );
}

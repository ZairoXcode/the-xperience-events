'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { Sparkles, Calendar, ArrowRight, ShieldAlert, Bot } from 'lucide-react';
import { Logo } from '../components/common/Logo';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/events');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col justify-between">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <Logo size={36} className="group-hover:scale-105 transition-transform" />
          <span className="text-xl font-headline font-bold text-[#1F3A32]">
            The Xperience
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-[#1F3A32] hover:text-[#172C26] px-3 py-1.5 rounded-md transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-xs font-semibold bg-[#1F3A32] text-white hover:bg-[#172C26] px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-headline font-extrabold text-[#1F3A32] tracking-tight leading-tight">
          Transform Conversations into Structured Event Intelligence
        </h1>

        <p className="mt-4 text-base text-[#5A5A5A] max-w-2xl mx-auto leading-relaxed">
          An operational platform that updates guest counts, schedules relative catering deadlines, audits vendor availability, and surfaces capacity shortage risks in real time.
        </p>

        <div className="mt-8 flex items-center justify-center">
          <Link
            href="/register"
            className="w-full sm:w-auto px-7 py-3.5 bg-[#1F3A32] hover:bg-[#172C26] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-[#C8A96B]" />
            <span>Create Your Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Feature Pillars */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E0D0] shadow-xs">
            <div className="flex items-center space-x-3 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8E0D0] flex items-center justify-center text-[#1F3A32] flex-shrink-0">
                <Bot className="w-4 h-4 text-[#1F3A32]" />
              </div>
              <h3 className="text-sm font-headline font-bold text-[#1F3A32]">
                Conversational State Sync
              </h3>
            </div>
            <p className="text-xs text-[#5A5A5A] leading-relaxed">
              Updates event data safely through schema-validated operations and real-time dashboard sync.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E0D0] shadow-xs">
            <div className="flex items-center space-x-3 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8E0D0] flex items-center justify-center text-amber-800 flex-shrink-0">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
              </div>
              <h3 className="text-sm font-headline font-bold text-[#1F3A32]">
                Automated Risk Detection
              </h3>
            </div>
            <p className="text-xs text-[#5A5A5A] leading-relaxed">
              Identifies vendor conflicts and capacity deficits (e.g. 200 guests vs 150 vehicle capacity).
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E0D0] shadow-xs">
            <div className="flex items-center space-x-3 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8E0D0] flex items-center justify-center text-[#6B5328] flex-shrink-0">
                <Calendar className="w-4 h-4 text-[#C8A96B]" />
              </div>
              <h3 className="text-sm font-headline font-bold text-[#1F3A32]">
                Relative Milestone Engine
              </h3>
            </div>
            <p className="text-xs text-[#5A5A5A] leading-relaxed">
              Calculates relative milestones and deadlines automatically based on your event timeline.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-[#E8E0D0] text-center text-xs text-[#8A8A8A]">
        Event Management Operations Platform • Real-Time Planning & Coordination
      </div>
    </div>
  );
}

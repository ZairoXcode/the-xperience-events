'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from './Logo';

export const Header: React.FC<{ activeEventName?: string }> = ({
  activeEventName,
}) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <header className="bg-[#1F3A32] text-white border-b border-[#2A4D43] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/events" className="flex items-center space-x-3 group">
            <Logo size={34} className="group-hover:scale-105 transition-transform" />
            <div>
              <span className="text-lg font-headline font-semibold tracking-tight text-white block leading-tight">
                The Xperience
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#A8B5A0] block font-mono">
                AI Event Operations
              </span>
            </div>
          </Link>

          {activeEventName && (
            <div className="hidden md:flex items-center space-x-2 text-xs border-l border-[#2A4D43] pl-6 py-1">
              <span className="text-[#A8B5A0]">Current Event:</span>
              <span className="font-medium text-white truncate max-w-[240px] px-2.5 py-0.5 rounded-full bg-[#162B25] border border-[#2A4D43]">
                {activeEventName}
              </span>
            </div>
          )}
        </div>

        {/* Navigation & Standard SaaS controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            href="/events"
            className="text-xs font-medium text-[#A8B5A0] hover:text-white px-3 py-1.5 rounded-md hover:bg-[#2A4D43] transition-colors flex items-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Events Hub</span>
          </Link>

          {/* User Profile Menu */}
          {user && (
            <div className="relative border-l border-[#2A4D43] pl-3 ml-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-[#2A4D43] transition-colors focus:outline-none"
                aria-expanded={menuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-[#162B25] border border-[#C8A96B]/50 flex items-center justify-center text-xs font-bold text-[#C8A96B] shadow-xs">
                  {userInitial}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#A8B5A0] transition-transform duration-200 ${
                    menuOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Standard Dropdown Card */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-[#E8E0D0] py-2 z-50 text-[#202020]">
                  <div className="px-4 py-3 border-b border-[#E8E0D0]">
                    <p className="text-xs font-bold text-[#1F3A32] truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-[#8A8A8A] truncate font-mono mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/events"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs text-[#5A5A5A] hover:text-[#1F3A32] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#8A8A8A]" />
                      <span>Events Hub</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#E8E0D0] pt-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

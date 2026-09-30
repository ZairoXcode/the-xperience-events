'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';
import { Logo } from '../../components/common/Logo';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, name, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E8E0D0] sm:rounded-xl sm:px-10">
          <div className="text-center mb-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center group mb-4"
            >
              <Logo size={44} className="shadow-xs group-hover:scale-105 transition-transform" />
            </Link>
            <h2 className="text-2xl font-headline font-bold text-[#1F3A32] tracking-tight">
              Create an Account
            </h2>
            <p className="mt-1 text-xs text-[#5A5A5A]">
              Event Management Operations Platform
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#202020] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full px-3 py-2 text-xs border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202020] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 text-xs border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202020] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 text-xs border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#1F3A32] hover:bg-[#172C26] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Register'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-[#5A5A5A]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-[#1F3A32] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { api } from '../../../utils/api';
import { useToast } from '../../../components/Toast';

export default function ChangePasswordPage() {
  const toast = useToast();
  const { activeTheme, changeTheme } = useThemeCustomizer(toast);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password. Please check your current password.');
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
      {/* Header title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Security Settings</h1>
        <p className="mt-1 text-xs text-slate-400 font-semibold font-sans">
          Update your administrative credential settings and key account password parameters.
        </p>
      </div>

      {/* Security alert notification banner (inline) */}
      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 font-semibold animate-fadeIn flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-rose-400 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Main glass security credentials card */}
      <div className="glass-card-indigo rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-600/5 blur-xl pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Current Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4.5 w-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                </svg>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-650 outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>

          <div className="border-t border-slate-800/80 my-6" />

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4.5 w-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-650 outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4.5 w-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-650 outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-button w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg active:opacity-90 disabled:opacity-55 transition-all cursor-pointer"
          >
            {loading ? 'Updating Credentials...' : 'Save New Password'}
          </button>
        </form>

      </div>

      {/* Theme Accent Customizer Card */}
      <div className="glass-card rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-blue-600/5 blur-xl pointer-events-none" />
        <h2 className="text-base font-extrabold text-white mb-2">Workspace Personalization</h2>
        <p className="text-xs text-slate-400 font-semibold mb-6">Choose your preferred administrative layout accent highlight theme</p>

        <div className="flex gap-4">
          {[
            { name: 'blue', color: 'bg-blue-500', label: 'Cobalt Blue' },
            { name: 'emerald', color: 'bg-emerald-500', label: 'Neon Emerald' },
            { name: 'amber', color: 'bg-amber-500', label: 'Sunset Amber' },
            { name: 'purple', color: 'bg-purple-500', label: 'Royal Purple' }
          ].map((t) => (
            <button
              key={t.name}
              onClick={() => changeTheme(t.name)}
              className={`flex-1 flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTheme === t.name 
                  ? 'bg-slate-950/60 border-blue-500/40 text-white shadow-lg' 
                  : 'bg-slate-950/25 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span className={`h-6 w-6 rounded-full ${t.color} shadow-lg`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Custom theme state helper
import { useEffect, useState } from 'react';
function useThemeCustomizer(toast) {
  const [activeTheme, setActiveTheme] = useState('blue');

  useEffect(() => {
    const saved = localStorage.getItem('theme_accent') || 'blue';
    setActiveTheme(saved);
    applyThemeCSS(saved);
  }, []);

  const applyThemeCSS = (theme) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'amber') {
        root.style.setProperty('--primary-accent', '#f59e0b');
        root.style.setProperty('--primary-accent-rgb', '245, 158, 11');
      } else if (theme === 'emerald') {
        root.style.setProperty('--primary-accent', '#10b981');
        root.style.setProperty('--primary-accent-rgb', '16, 185, 129');
      } else if (theme === 'purple') {
        root.style.setProperty('--primary-accent', '#a855f7');
        root.style.setProperty('--primary-accent-rgb', '168, 85, 247');
      } else {
        root.style.setProperty('--primary-accent', '#3b82f6');
        root.style.setProperty('--primary-accent-rgb', '59, 130, 246');
      }
    }
  };

  const changeTheme = (theme) => {
    localStorage.setItem('theme_accent', theme);
    setActiveTheme(theme);
    applyThemeCSS(theme);
    toast.success(`${theme.toUpperCase()} theme accent applied!`);
  };

  return { activeTheme, changeTheme };
}

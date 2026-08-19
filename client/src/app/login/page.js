'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';

export default function Login() {
  const router = useRouter();
  const toast = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('isLoggined') === 'true' && localStorage.getItem('token')) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Handle Register
        await api.post('/admin/register', { username, password });
        setSuccess('Account created successfully! Please sign in.');
        toast.success('Account created successfully! Please sign in.');
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        // Handle Login
        const data = await api.post('/admin/login', { username, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('adminUsername', data.admin.username);
        localStorage.setItem('isLoggined', 'true');
        
        // Success animation transition
        setShowSuccessAnim(true);
        toast.success('Login Successful!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      toast.error(err.message || 'An error occurred. Please try again.');
    } finally {
      if (!showSuccessAnim) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      {/* LEFT PANEL: High Quality Image & Branding (Visible on LG screens) */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden border-r border-zinc-800 bg-[#0c0c0e] select-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/20 to-transparent z-10" />
        
        <img 
          src="/images/login_education.png" 
          alt="Education" 
          className="absolute inset-0 w-full h-full object-cover opacity-35 scale-100"
        />

        {/* Branding header */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#2563eb] flex items-center justify-center font-bold text-white text-[10px]">
            BFGI
          </div>
          <div>
            <span className="font-bold text-zinc-100 tracking-tight text-xs block leading-tight">Baba Farid College of</span>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase leading-none">Engineering & Technology</span>
          </div>
        </div>

        {/* Bottom quotes */}
        <div className="relative z-20 mt-auto max-w-sm saas-fade-in">
          <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
            Streamlining Academic Evaluation
          </h2>
          <p className="text-zinc-400 mt-3 text-xs leading-relaxed">
            A comprehensive, high-fidelity platform tailored for modern educators. Manage subjects, enroll students, compute metrics, and track academic trajectories with minimal effort.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-6 sm:px-16 py-12 relative">
        {/* Mobile top branding */}
        <div className="lg:hidden flex items-center gap-3 mb-10 mx-auto">
          <div className="h-9 w-9 rounded-lg bg-[#2563eb] flex items-center justify-center font-bold text-white text-[10px]">
            BFGI
          </div>
          <div>
            <span className="font-bold text-zinc-100 tracking-tight text-xs block leading-tight">Baba Farid College of</span>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase leading-none">Engineering & Technology</span>
          </div>
        </div>

        {/* Form Wrap Container */}
        <div className="w-full max-w-md mx-auto relative saas-card p-8 bg-[#09090b]">
          
          {/* SUCCESS SCREEN OVERLAY */}
          {showSuccessAnim && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#09090b] rounded-lg p-8 border border-zinc-800 text-center saas-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Welcome Back</h2>
              <p className="mt-1.5 text-xs text-zinc-400">Login successful. Accessing portal...</p>
            </div>
          )}

          {/* Intro Headers */}
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight text-white">
              {isSignUp ? 'Educator Sign Up' : 'Portal Access'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {isSignUp ? 'Create a secure administrator account' : 'Sign in to access your grading workspace'}
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex border border-zinc-800 bg-[#0c0c0e] p-1 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}
              className={`flex-1 text-center py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
                !isSignUp 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}
              className={`flex-1 text-center py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
                isSignUp 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="e.g. prof_sharma"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  className="saas-input w-full !pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="saas-input w-full !pl-10"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="saas-fade-in">
                <label htmlFor="confirmPassword" className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="saas-input w-full !pl-10"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="saas-btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Processing...
                </span>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 text-center">
            <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest">
              Authorized Educator Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

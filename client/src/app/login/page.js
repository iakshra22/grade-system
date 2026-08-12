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
        }, 1800);
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
    <div className="relative min-h-screen flex bg-[#050714] text-slate-100 overflow-hidden font-sans">
      {/* Background glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[50vw] w-[50vw] rounded-full bg-blue-600/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] -z-10 h-[55vw] w-[55vw] rounded-full bg-indigo-600/10 blur-[160px] animate-pulse-glow" style={{ animationDelay: '-5s' }} />

      {/* LEFT PANEL: High Quality Image (Visible on LG screens) */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-12 overflow-hidden border-r border-slate-800/40 select-none">
        {/* Deep blue/purple radial overlay for illustration */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050714] via-[#050714]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-blue-950/20 backdrop-blur-[1px] z-0" />
        
        {/* The generated high-fidelity illustration */}
        <img 
          src="/images/login_education.png" 
          alt="Education Illustration" 
          className="absolute inset-0 w-full h-full object-cover opacity-65 scale-105 animate-float-reverse"
        />

        {/* Branding header */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-blue-500/20">
            AG
          </div>
          <div>
            <span className="font-extrabold text-white tracking-wider text-base block">AetherGrade</span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Grading Systems</span>
          </div>
        </div>

        {/* Bottom quotes */}
        <div className="relative z-20 mt-auto max-w-md animate-slideIn">
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Streamlining Academic Evaluation
          </h2>
          <p className="text-slate-300 mt-4 text-sm font-medium leading-relaxed">
            A comprehensive, high-fidelity platform tailored for modern educators. Manage subjects, enroll students, compute metrics, and track academic trajectories with minimal effort.
          </p>
          <div className="flex gap-1.5 mt-6">
            <span className="h-1 w-8 rounded-full bg-blue-500" />
            <span className="h-1 w-2 rounded-full bg-slate-700" />
            <span className="h-1 w-2 rounded-full bg-slate-700" />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form */}
      <div className="w-full lg:w-[52%] flex flex-col justify-center px-6 sm:px-16 py-12 relative">
        {/* Mobile top branding */}
        <div className="lg:hidden flex items-center gap-3 mb-10 mx-auto animate-fadeIn">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-lg">
            AG
          </div>
          <div>
            <span className="font-extrabold text-white tracking-wider text-base block">AetherGrade</span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Grading Systems</span>
          </div>
        </div>

        {/* Form Wrap Container */}
        <div className="w-full max-w-md mx-auto relative">
          
          {/* SUCCESS SCREEN OVERLAY */}
          {showSuccessAnim && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#070b1e]/95 rounded-3xl p-8 border border-emerald-500/20 text-center animate-scaleIn">
              {/* Animated drawing SVG checkmark */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-10 w-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" className="animate-checkmark" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-wide">Welcome Back!</h2>
              <p className="mt-2 text-sm text-slate-400 font-semibold">Login Successful. Redirecting to portal...</p>
            </div>
          )}

          {/* Intro Headers */}
          <div className="mb-8 animate-slideIn">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {isSignUp ? 'Educator Sign Up' : 'Portal Access'}
            </h1>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              {isSignUp ? 'Establish a secure credentials account' : 'Sign in to access your administrative workspace'}
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex border border-slate-800/80 bg-slate-950/45 p-1 rounded-2xl mb-6 animate-slideIn" style={{ animationDelay: '0.1s' }}>
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}
              className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                !isSignUp 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}
              className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                isSignUp 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-900/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 animate-fadeIn font-semibold flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-rose-400 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-300 animate-fadeIn font-semibold flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-emerald-400 shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 animate-slideIn" style={{ animationDelay: '0.2s' }}>
            <div>
              <label htmlFor="username" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Teacher Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4.5 w-4.5">
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
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/45 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-650 outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-slate-950/80 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4.5 w-4.5">
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
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/45 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-650 outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-slate-950/80 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="animate-fadeIn">
                <label htmlFor="confirmPassword" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4.5 w-4.5">
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
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/45 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-650 outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-slate-950/80 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="glow-button w-full select-none rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 px-4 text-sm font-bold text-white shadow-xl shadow-blue-900/20 active:opacity-90 disabled:opacity-50 transition-all duration-300 cursor-pointer"
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
          <div className="mt-12 text-center animate-fadeIn" style={{ animationDelay: '0.35s' }}>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">
              AetherGrade Academic Portal. Built for authorized educators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

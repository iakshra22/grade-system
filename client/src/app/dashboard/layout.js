'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '../../components/Toast';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  
  const [adminUsername, setAdminUsername] = useState('Teacher');
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  
  // Interactive UI Dropdowns
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const [notificationsList, setNotificationsList] = useState([
    { id: 1, text: 'Welcome to the AetherGrade SaaS overhaul!', time: 'Just now', read: false },
    { id: 2, text: 'Database synchronization completed.', time: '5m ago', read: false },
    { id: 3, text: 'Semester grading templates updated.', time: '2h ago', read: true }
  ]);

  const handleMarkAllRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleMarkOneRead = (id) => {
    setNotificationsList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme_accent') || 'blue';
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
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggined') === 'true';
    const username = localStorage.getItem('adminUsername');
    if (!token || !isLoggedIn) {
      router.push('/login');
    } else {
      if (username) setAdminUsername(username);
      setLoading(false);
    }
  }, [router]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('isLoggined');
    setAdminUsername('');
    toast.success('Logged out successfully.');
    router.push('/login');
  };

  const navItems = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
        </svg>
      )
    },
    {
      name: 'Students',
      path: '/dashboard/students',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A2.25 2.25 0 0 1 12.75 21.5h-1.5a2.25 2.25 0 0 1-2.25-2.263V19.13m-4.743-1.638a4.125 4.125 0 0 1 7.533-2.493M3.75 19.128v-.003c0-1.113.285-2.16.786-3.07M3.75 19.128v.109A2.25 2.25 0 0 0 6 21.5h1.5a2.25 2.25 0 0 0 2.25-2.263V19.13M9 8.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12.75 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-7.5 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      )
    },
    {
      name: 'Subjects',
      path: '/dashboard/subjects',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      )
    },
    {
      name: 'Marks & Grading',
      path: '/dashboard/marks',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM1.372 15.753A10.5 10.5 0 019 12.25c2.327 0 4.512.753 6.302 2.032m-13.93 0c-.397.287-.624.757-.624 1.258V18A2.25 2.25 0 0 0 3 20.25h12A2.25 2.25 0 0 0 17.25 18v-1.02a2.25 2.25 0 0 0-.624-1.258" />
        </svg>
      )
    },
    {
      name: 'Change Password',
      path: '/dashboard/change-password',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050714] text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-400">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050714] font-sans text-slate-100 relative overflow-hidden">
      {/* Background Floating Blobs */}
      <div className="absolute top-[10%] left-[5%] -z-10 h-[30vw] w-[30vw] rounded-full bg-blue-600/5 blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-[15%] right-[5%] -z-10 h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: '-4s' }} />

      {/* MOBILE HEADER (Drawer trigger) */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-[#070a1e]/90 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow">
            AG
          </div>
          <span className="font-extrabold text-white tracking-wider text-base">AetherGrade</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/80 hover:text-white transition-all cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </header>

      {/* SIDEBAR NAVIGATION (Desktop + Mobile overlay) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transform border-r border-slate-800/50 bg-[#070b1e]/95 backdrop-blur-2xl transition-all duration-300 lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${desktopSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="flex h-full flex-col justify-between p-6">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3.5 mb-10 mt-2">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-blue-600/20">
                AG
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${desktopSidebarCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-auto opacity-100'}`}>
                <span className="font-extrabold text-white tracking-wider text-base block whitespace-nowrap">AetherGrade</span>
                <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase block whitespace-nowrap">Teacher Portal</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold tracking-wide transition-all duration-300 relative group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-slate-400 hover:bg-slate-800/25 hover:text-slate-200'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}>{item.icon}</span>
                    <span className={`transition-all duration-300 ${desktopSidebarCollapsed ? 'lg:opacity-0 lg:w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
                      {item.name}
                    </span>
                    {/* Active Route Side Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md" />
                    )}
                    {/* Collapsed Tooltip */}
                    {desktopSidebarCollapsed && (
                      <div className="absolute left-22 scale-0 group-hover:scale-100 pointer-events-none z-50 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap shadow-xl transition-all duration-200">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User profile details at bottom */}
          <div className="border-t border-slate-800/80 pt-6">
            <div className={`flex items-center gap-3 px-2 mb-4 overflow-hidden`}>
              <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center text-sm font-bold text-blue-300">
                {adminUsername[0].toUpperCase()}
              </div>
              <div className={`transition-all duration-300 ${desktopSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto'}`}>
                <p className="text-sm font-bold text-white truncate leading-tight">{adminUsername}</p>
                <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5 whitespace-nowrap">Administrator</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold tracking-wide text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              <span className={`transition-all duration-300 ${desktopSidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto'}`}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* CORE WORKSPACE FRAME CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0 min-h-screen">
        
        {/* DESKTOP TOP NAVIGATION BAR */}
        <header className="hidden lg:flex h-18 items-center justify-between border-b border-slate-800/40 px-10 bg-[#050714]/80 backdrop-blur-md sticky top-0 z-20">
          
          {/* Collapse sidebar button & Search bar */}
          <div className="flex items-center gap-6 flex-1 max-w-lg">
            <button
              onClick={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
              className="rounded-xl border border-slate-800/60 bg-slate-950/20 hover:bg-slate-900/50 p-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>

            {/* Slick Search Bar */}
            <div className="relative w-full group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-4.5 w-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Quick search student profiles, records..."
                className="w-full rounded-2xl border border-slate-800/60 bg-slate-950/30 py-2.5 pl-10 pr-12 text-xs font-semibold text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-slate-950/80 focus:ring-4 focus:ring-blue-500/5"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border border-slate-800 bg-slate-900 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                ⌘K
              </div>
            </div>
          </div>

          {/* Right Action Icons & Profile Card */}
          <div className="flex items-center gap-5">
            
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative rounded-xl border border-slate-800/60 bg-slate-950/20 hover:bg-slate-900/50 p-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {/* Active Notification Indicator (only if unread exists) */}
                {notificationsList.some(n => !n.read) && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-blue-500 shadow shadow-blue-500/50" />
                )}
              </button>

              {/* Notification dropdown panel */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-800/80 bg-[#070b1e]/95 backdrop-blur-2xl p-4 shadow-2xl animate-scaleIn z-50">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <span className="text-xs font-bold text-white tracking-wide">Notifications</span>
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notificationsList.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleMarkOneRead(notif.id)}
                        className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-colors cursor-pointer ${
                          notif.read 
                            ? 'bg-slate-950/20 border-slate-800/20 hover:bg-slate-950/40' 
                            : 'bg-blue-950/20 border-blue-500/20 hover:bg-blue-950/40'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className={`text-xs leading-normal ${notif.read ? 'text-slate-400 font-medium' : 'text-slate-200 font-semibold'}`}>
                            {notif.text}
                          </p>
                          {!notif.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 mt-1.5 animate-pulse" />}
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3.5 pl-2.5 pr-3 py-1.5 rounded-xl border border-slate-800/60 bg-slate-950/20 hover:bg-slate-900/50 transition-colors cursor-pointer text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">
                  {adminUsername[0].toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block leading-tight">{adminUsername}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Administrator</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Profile options panel */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-slate-800/80 bg-[#070b1e]/95 backdrop-blur-2xl p-2.5 shadow-2xl animate-scaleIn z-50">
                  <Link
                    href="/dashboard/change-password"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800/40 hover:text-white transition-all duration-150"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                    Credentials Info
                  </Link>
                  <div className="border-t border-slate-800/80 my-1.5" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all duration-150 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE PAGES RENDER VIEW */}
        <main className="flex-1 flex flex-col min-w-0 p-6 lg:p-10 overflow-y-auto max-h-[calc(100vh-4.5rem)] lg:max-h-[calc(100vh-4.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}

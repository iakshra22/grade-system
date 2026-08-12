'use client';

import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import Link from 'next/link';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    studentsCount: 0,
    subjectsCount: 0,
    passRate: 0,
    failCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);

  // To-Do Notes State
  const [todoText, setTodoText] = useState('');
  const [todos, setTodos] = useState([]);

  // Load todos on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`todos_${localStorage.getItem('adminUsername') || 'default'}`);
      if (saved) {
        try {
          setTodos(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const addTodo = (e) => {
    e.preventDefault();
    if (!todoText.trim()) return;
    const newTodos = [...todos, { id: Date.now(), text: todoText.trim(), completed: false }];
    setTodos(newTodos);
    localStorage.setItem(`todos_${localStorage.getItem('adminUsername') || 'default'}`, JSON.stringify(newTodos));
    setTodoText('');
  };

  const toggleTodo = (id) => {
    const newTodos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    setTodos(newTodos);
    localStorage.setItem(`todos_${localStorage.getItem('adminUsername') || 'default'}`, JSON.stringify(newTodos));
  };

  const deleteTodo = (id) => {
    const newTodos = todos.filter(todo => todo.id !== id);
    setTodos(newTodos);
    localStorage.setItem(`todos_${localStorage.getItem('adminUsername') || 'default'}`, JSON.stringify(newTodos));
  };

  const exportToCSV = () => {
    if (allReports.length === 0) return;
    const headers = ['Roll Number', 'Name', 'Class', 'Email', 'Percentage', 'Grade', 'Status'];
    const rows = allReports.map(r => [
      r.rollNumber,
      `${r.firstName} ${r.lastName}`,
      r.class,
      r.email || 'N/A',
      `${r.summary.percentage}%`,
      r.summary.grade,
      r.summary.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_grades_${localStorage.getItem('adminUsername') || 'teacher'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    async function loadStats() {
      try {
        const students = await api.get('/students');
        const subjects = await api.get('/subjects');
        const studentReports = await api.get('/marks/reports');

        setAllReports(studentReports);
        setReports(studentReports.slice(0, 5)); // Get top 5 for preview

        const totalStudents = students.length;
        const totalSubjects = subjects.length;

        // Calculate pass rate
        let passCount = 0;
        let failCount = 0;
        let gradedStudents = 0;

        studentReports.forEach(rep => {
          if (rep.subjectsCount > 0) {
            gradedStudents++;
            if (rep.summary.status === 'Pass') {
              passCount++;
            } else {
              failCount++;
            }
          }
        });

        const passRate = gradedStudents > 0 ? Math.round((passCount / gradedStudents) * 100) : 0;

        setStats({
          studentsCount: totalStudents,
          subjectsCount: totalSubjects,
          passRate,
          failCount
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-400">Loading overview data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 2-Column Asymmetrical Core Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* LEFT COLUMN: Main Dashboard Content (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Welcome Banner Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl shadow-indigo-950/20">
            {/* Ambient background blur blobs */}
            <div className="absolute right-[-10%] top-[-30%] w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute right-[20%] bottom-[-50%] w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Academic Overview
                </h1>
                <p className="text-blue-100 text-sm mt-2 font-medium max-w-md">
                  Welcome to your command center. Check student grades, metrics, and manage academic resources.
                </p>
              </div>
              <Link
                href="/dashboard/marks"
                className="select-none rounded-xl bg-white text-indigo-700 px-5 py-3 text-xs font-bold shadow hover:bg-slate-50 transition-all active:scale-95 duration-200 cursor-pointer shrink-0"
              >
                Go to Grading Panel
              </Link>
            </div>
          </div>

          {/* Grid of Statistical Metric Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Metric 1: Total Enrolled Students */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-blue-600/5 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 border border-blue-500/15">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A2.25 2.25 0 0 1 12.75 21.5h-1.5a2.25 2.25 0 0 1-2.25-2.263V19.13" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white tracking-tight">{stats.studentsCount}</span>
                <p className="mt-1.5 text-xs text-slate-500 font-bold">Students registered</p>
              </div>
            </div>

            {/* Metric 2: Total Subjects List */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-600/5 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Modules</span>
                <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 border border-indigo-500/15">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white tracking-tight">{stats.subjectsCount}</span>
                <p className="mt-1.5 text-xs text-slate-500 font-bold">Subjects created</p>
              </div>
            </div>

            {/* Metric 3: Passing Rate Ratio */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-600/5 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Passing Rate</span>
                <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/15">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white tracking-tight">{stats.passRate}%</span>
                <p className="mt-1.5 text-xs text-slate-500 font-bold">Successful passing ratio</p>
              </div>
            </div>

            {/* Metric 4: Attention Demanded */}
            <div className="glass-card-purple rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-purple-600/5 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Failing Grades</span>
                <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/15">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white tracking-tight">{stats.failCount}</span>
                <p className="mt-1.5 text-xs text-slate-500 font-bold">Students failing subjects</p>
              </div>
            </div>

          </div>

          {/* Recent Student Reports Table Grid */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-extrabold text-white tracking-wide">Recent Academic Performance</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">First-line metrics of recently updated students</p>
              </div>
              <div className="flex items-center gap-3">
                {allReports.length > 0 && (
                  <button 
                    onClick={exportToCSV}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900/50 px-3 py-1.5 text-xs font-bold text-slate-350 hover:text-white transition-all cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5 text-blue-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export CSV
                  </button>
                )}
                <Link href="/dashboard/marks" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  View Transcripts →
                </Link>
              </div>
            </div>
            
            {reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                <p className="text-sm text-slate-400 font-semibold">No grades recorded yet</p>
                <Link
                  href="/dashboard/marks"
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:opacity-95 shadow transition-all cursor-pointer"
                >
                  Assign Student Marks
                </Link>
              </div>
            ) : (
              <div className="table-container">
                <table className="w-full text-left text-sm text-slate-300 zebra-table">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="pb-3.5 pt-3 px-4">Student Info</th>
                      <th className="pb-3.5 pt-3 px-4">Class</th>
                      <th className="pb-3.5 pt-3 px-4">Score Ratio</th>
                      <th className="pb-3.5 pt-3 px-4">Grade</th>
                      <th className="pb-3.5 pt-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {reports.map((report) => (
                      <tr key={report.id} className="transition-colors group">
                        <td className="py-3.5 px-4 font-bold text-white group-hover:text-blue-400 transition-colors">
                          {report.firstName} {report.lastName}
                          <span className="block text-[10px] font-semibold text-slate-500 mt-0.5">{report.rollNumber}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-400">{report.class}</td>
                        <td className="py-3.5 px-4 font-extrabold text-white">{report.summary.percentage}%</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-extrabold ${
                            report.summary.grade === 'F' 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/15' 
                              : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/15'
                          }`}>
                            {report.summary.grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            report.summary.status === 'Pass' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/15'
                          }`}>
                            {report.summary.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Controls Panel & Analytics Insights (1/3 width) */}
        <div className="space-y-8">
          
          {/* Quick Actions Panel */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-base font-extrabold text-white mb-6 tracking-wide">Quick Controls</h2>
            <div className="space-y-3.5">
              
              <Link
                href="/dashboard/students"
                className="flex items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-950/20 hover:bg-slate-950/80 p-4 transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400 group-hover:bg-blue-500/20 transition-all border border-blue-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Register Student</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Add profile to student indexes</p>
                </div>
              </Link>

              <Link
                href="/dashboard/subjects"
                className="flex items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-950/20 hover:bg-slate-950/80 p-4 transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 group-hover:bg-indigo-500/20 transition-all border border-indigo-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Add New Subject</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Register course codes & modules</p>
                </div>
              </Link>

              <Link
                href="/dashboard/marks"
                className="flex items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-950/20 hover:bg-slate-950/80 p-4 transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400 group-hover:bg-purple-500/20 transition-all border border-purple-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 20.013a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Compute Grading</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Input raw marks and verify status</p>
                </div>
              </Link>

            </div>
          </div>

          {/* Academic Insights Detail Card */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-base font-extrabold text-white mb-5 tracking-wide">Insights Analytics</h2>
            
            <div className="space-y-5">
              
              {/* Circular Progress Representation UI */}
              <div className="flex items-center justify-around py-2 border-b border-slate-800/65 pb-4">
                <div className="relative flex items-center justify-center">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                    <circle cx="40" cy="40" r="32" stroke="url(#blueIndigoGradient)" strokeWidth="6" fill="transparent" 
                      strokeDasharray="201" 
                      strokeDashoffset={201 - (201 * stats.passRate) / 100}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="blueIndigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-sm font-extrabold text-white">{stats.passRate}%</span>
                    <span className="block text-[8px] text-slate-500 font-bold uppercase">Pass</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-300">Class Performance</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium pl-4 max-w-[130px]">
                    Average grade ratio exceeds required criteria threshold.
                  </p>
                </div>
              </div>

              {/* Grade Distribution Bars */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Grade Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries({
                    'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0
                  }).map(([grade]) => {
                    const count = allReports.filter(r => r.subjectsCount > 0 && r.summary.grade === grade).length;
                    const totalGraded = allReports.filter(r => r.subjectsCount > 0).length;
                    const percentage = totalGraded > 0 ? (count / totalGraded) * 100 : 0;
                    return (
                      <div key={grade} className="flex items-center gap-3 text-xs font-bold">
                        <span className="w-6 text-slate-400">{grade}</span>
                        <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              grade === 'F' ? 'bg-rose-500' : grade === 'A+' || grade === 'A' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-4 text-right text-slate-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Text Summary Info */}
              <div className="space-y-2.5 pt-3 border-t border-slate-800/60">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Total Graded Profiles</span>
                  <span className="text-white">{allReports.filter(r => r.subjectsCount > 0).length}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Total Pending Graded</span>
                  <span className="text-white">{Math.max(0, stats.studentsCount - allReports.filter(r => r.subjectsCount > 0).length)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Database Connection</span>
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Healthy
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* TOP PERFORMERS CARD (LEADERBOARD) */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-base font-extrabold text-white mb-4 tracking-wide">Top Performers</h2>
            {allReports.filter(r => r.subjectsCount > 0).length === 0 ? (
              <p className="text-xs text-slate-500 font-semibold py-4">No graded student records found</p>
            ) : (
              <div className="space-y-3.5">
                {[...allReports]
                  .filter(r => r.subjectsCount > 0)
                  .sort((a, b) => b.summary.percentage - a.summary.percentage)
                  .slice(0, 3)
                  .map((topper, index) => (
                    <div key={topper.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/20 border border-slate-800/50">
                      <div className="flex items-center gap-3">
                        <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                          index === 0 ? 'bg-amber-500/20 text-amber-400' : index === 1 ? 'bg-slate-300/20 text-slate-350' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-white block">{topper.firstName} {topper.lastName}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">{topper.rollNumber}</span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-indigo-400">{topper.summary.percentage}%</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* TEACHER REMINDERS / TO-DO WIDGET */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-base font-extrabold text-white mb-1 tracking-wide">Teacher Notepad</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-4">Quick academic reminders</p>
            
            <form onSubmit={addTodo} className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="e.g. Schedule Math Test..."
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-xs text-white placeholder-slate-650 outline-none transition focus:border-blue-500/50"
              />
              <button 
                type="submit"
                className="rounded-xl bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-500 active:scale-95 cursor-pointer"
              >
                Add
              </button>
            </form>

            {todos.length === 0 ? (
              <p className="text-xs text-slate-500 font-semibold py-3 text-center">No tasks. Enjoy your day!</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {todos.map(todo => (
                  <div key={todo.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/20 border border-slate-850">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input 
                        type="checkbox" 
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="h-3.5 w-3.5 rounded border-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0 bg-transparent cursor-pointer"
                      />
                      <span className={`text-xs font-medium truncate ${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {todo.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 transition cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

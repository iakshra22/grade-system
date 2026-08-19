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
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <p className="text-xs text-zinc-400">Loading overview data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 saas-fade-in">
      
      {/* 2-Column Asymmetrical Core Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* LEFT COLUMN: Main Dashboard Content (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Welcome Banner Card */}
          <div className="saas-card p-6 bg-[#09090b]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Academic Overview
                </h1>
                <p className="text-zinc-400 text-xs mt-1 max-w-md leading-relaxed">
                  Welcome to the grading system command center. Access student profiles, subject metrics, and manage academic performance transcripts.
                </p>
              </div>
              <Link
                href="/dashboard/marks"
                className="saas-btn-primary py-2 text-xs"
              >
                Go to Grading Panel
              </Link>
            </div>
          </div>

          {/* Grid of Statistical Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            
            {/* Metric 1: Total Enrolled Students */}
            <div className="saas-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total Enrolled</span>
                <div className="text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A2.25 2.25 0 0 1 12.75 21.5h-1.5a2.25 2.25 0 0 1-2.25-2.263V19.13" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white tracking-tight">{stats.studentsCount}</span>
                <p className="mt-0.5 text-[10px] text-zinc-500 font-semibold">Registered student profiles</p>
              </div>
            </div>

            {/* Metric 2: Total Subjects List */}
            <div className="saas-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total Modules</span>
                <div className="text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white tracking-tight">{stats.subjectsCount}</span>
                <p className="mt-0.5 text-[10px] text-zinc-500 font-semibold">Created subject modules</p>
              </div>
            </div>

            {/* Metric 3: Passing Rate Ratio */}
            <div className="saas-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Passing Rate</span>
                <div className="text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white tracking-tight">{stats.passRate}%</span>
                <p className="mt-0.5 text-[10px] text-zinc-500 font-semibold">Successful passing ratio</p>
              </div>
            </div>

            {/* Metric 4: Attention Demanded */}
            <div className="saas-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Failing Grades</span>
                <div className="text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white tracking-tight">{stats.failCount}</span>
                <p className="mt-0.5 text-[10px] text-zinc-500 font-semibold">Students failing modules</p>
              </div>
            </div>

          </div>

          {/* Recent Student Reports Table */}
          <div className="saas-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Recent Performance</h2>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Summary of recently updated grade reports</p>
              </div>
              <div className="flex items-center gap-3">
                {allReports.length > 0 && (
                  <button 
                    onClick={exportToCSV}
                    className="saas-btn-secondary px-2.5 py-1.5 text-[11px] h-7"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5 text-blue-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export CSV
                  </button>
                )}
                <Link href="/dashboard/marks" className="text-xs text-blue-500 hover:text-blue-450 transition-colors font-medium">
                  View Transcripts →
                </Link>
              </div>
            </div>
            
            {reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-800 rounded-lg bg-zinc-950/20">
                <p className="text-xs text-zinc-400">No grades recorded yet</p>
                <Link
                  href="/dashboard/marks"
                  className="mt-3 saas-btn-primary py-1.5 px-3 text-xs"
                >
                  Assign Student Marks
                </Link>
              </div>
            ) : (
              <div className="saas-table-container">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Student Info</th>
                      <th>Class</th>
                      <th>Score Ratio</th>
                      <th>Grade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td className="font-semibold text-white">
                          {report.firstName} {report.lastName}
                          <span className="block text-[10px] text-zinc-500 font-normal mt-0.5">{report.rollNumber}</span>
                        </td>
                        <td className="text-zinc-400 font-medium">{report.class}</td>
                        <td className="font-bold text-white">{report.summary.percentage}%</td>
                        <td>
                          <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold border ${
                            report.summary.grade === 'F' 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}>
                            {report.summary.grade}
                          </span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                            report.summary.status === 'Pass' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
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
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="saas-card p-6">
            <h2 className="text-sm font-bold text-white mb-4 tracking-tight">Quick Controls</h2>
            <div className="space-y-3">
              
              <Link
                href="/dashboard/students"
                className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-[#09090b] hover:bg-zinc-900/40 p-3 transition-colors group"
              >
                <div className="rounded bg-zinc-850 p-2 text-zinc-400 group-hover:text-blue-500 transition-colors border border-zinc-800">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Register Student</h3>
                  <p className="text-[10px] text-zinc-550 mt-0.5">Add profile to student indexes</p>
                </div>
              </Link>

              <Link
                href="/dashboard/subjects"
                className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-[#09090b] hover:bg-zinc-900/40 p-3 transition-colors group"
              >
                <div className="rounded bg-zinc-850 p-2 text-zinc-400 group-hover:text-blue-500 transition-colors border border-zinc-800">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Add New Subject</h3>
                  <p className="text-[10px] text-zinc-550 mt-0.5">Register course modules</p>
                </div>
              </Link>

              <Link
                href="/dashboard/marks"
                className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-[#09090b] hover:bg-zinc-900/40 p-3 transition-colors group"
              >
                <div className="rounded bg-zinc-850 p-2 text-zinc-400 group-hover:text-blue-500 transition-colors border border-zinc-800">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 20.013a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Compute Grading</h3>
                  <p className="text-[10px] text-zinc-550 mt-0.5">Input raw marks and verify status</p>
                </div>
              </Link>

            </div>
          </div>

          {/* Academic Insights Detail Card */}
          <div className="saas-card p-6">
            <h2 className="text-sm font-bold text-white mb-4 tracking-tight">Insights Analytics</h2>
            
            <div className="space-y-4">
              
              {/* Circular Progress Representation */}
              <div className="flex items-center justify-around py-1 border-b border-zinc-800 pb-4">
                <div className="relative flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="#18181b" strokeWidth="5" fill="transparent" />
                    <circle cx="32" cy="32" r="26" stroke="#2563eb" strokeWidth="5" fill="transparent" 
                      strokeDasharray="163" 
                      strokeDashoffset={163 - (163 * stats.passRate) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xs font-bold text-white">{stats.passRate}%</span>
                    <span className="block text-[7px] text-zinc-500 font-bold uppercase">Pass</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-zinc-300">Performance</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-normal max-w-[120px]">
                    Average grade ratio exceeds academic threshold.
                  </p>
                </div>
              </div>

              {/* Grade Distribution Bars */}
              <div>
                <h3 className="text-[10px] font-semibold text-zinc-500 mb-2.5 uppercase tracking-wider">Grade Breakdown</h3>
                <div className="space-y-1.5">
                  {Object.entries({
                    'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0
                  }).map(([grade]) => {
                    const count = allReports.filter(r => r.subjectsCount > 0 && r.summary.grade === grade).length;
                    const totalGraded = allReports.filter(r => r.subjectsCount > 0).length;
                    const percentage = totalGraded > 0 ? (count / totalGraded) * 100 : 0;
                    return (
                      <div key={grade} className="flex items-center gap-3 text-[11px] font-medium">
                        <span className="w-5 text-zinc-400">{grade}</span>
                        <div className="flex-1 h-1.5 bg-zinc-900 rounded overflow-hidden">
                          <div 
                            className={`h-full ${
                              grade === 'F' ? 'bg-red-500' : grade === 'A+' || grade === 'A' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-4 text-right text-zinc-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Text Summary Info */}
              <div className="space-y-2 pt-3 border-t border-zinc-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Total Graded Profiles</span>
                  <span className="text-white font-medium">{allReports.filter(r => r.subjectsCount > 0).length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Pending Grading</span>
                  <span className="text-white font-medium">{Math.max(0, stats.studentsCount - allReports.filter(r => r.subjectsCount > 0).length)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Database Connection</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    Healthy
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* TOP PERFORMERS CARD */}
          <div className="saas-card p-6">
            <h2 className="text-sm font-bold text-white mb-3 tracking-tight">Top Performers</h2>
            {allReports.filter(r => r.subjectsCount > 0).length === 0 ? (
              <p className="text-xs text-zinc-500 py-2">No graded records found</p>
            ) : (
              <div className="space-y-2">
                {[...allReports]
                  .filter(r => r.subjectsCount > 0)
                  .sort((a, b) => b.summary.percentage - a.summary.percentage)
                  .slice(0, 3)
                  .map((topper, index) => (
                    <div key={topper.id} className="flex items-center justify-between p-2.5 rounded border border-zinc-800 bg-[#09090b]">
                      <div className="flex items-center gap-2">
                        <span className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold ${
                          index === 0 ? 'bg-amber-500/10 text-amber-400' : index === 1 ? 'bg-zinc-800 text-zinc-300' : 'bg-orange-500/10 text-orange-400'
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <span className="text-xs font-semibold text-white block">{topper.firstName} {topper.lastName}</span>
                          <span className="text-[9px] text-zinc-550 uppercase">{topper.rollNumber}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-500">{topper.summary.percentage}%</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* TEACHER REMINDERS / TO-DO WIDGET */}
          <div className="saas-card p-6">
            <h2 className="text-sm font-bold text-white mb-0.5 tracking-tight">Notepad</h2>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-3">Academic reminders</p>
            
            <form onSubmit={addTodo} className="flex gap-2 mb-3">
              <input 
                type="text" 
                placeholder="e.g. Schedule Math Test..."
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                className="saas-input flex-1 py-1.5 text-xs"
              />
              <button 
                type="submit"
                className="saas-btn-primary py-1.5 px-3 text-xs"
              >
                Add
              </button>
            </form>

            {todos.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2 text-center">No tasks recorded</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {todos.map(todo => (
                  <div key={todo.id} className="flex items-center justify-between p-2 rounded border border-zinc-850 bg-[#09090b]">
                    <div className="flex items-center gap-2 min-w-0">
                      <input 
                        type="checkbox" 
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="h-3 w-3 rounded border-zinc-800 text-blue-600 bg-transparent focus:ring-0 focus:ring-offset-0 cursor-pointer animate-none"
                      />
                      <span className={`text-xs truncate ${todo.completed ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                        {todo.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="text-zinc-500 hover:text-red-400 p-0.5 transition cursor-pointer"
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

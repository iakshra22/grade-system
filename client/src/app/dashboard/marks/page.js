'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../utils/api';
import { useToast } from '../../../components/Toast';

export default function MarksPage() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [classAveragePercentage, setClassAveragePercentage] = useState(0);

  // Assign Marks form state
  const [assignForm, setAssignForm] = useState({
    subjectId: '',
    marksObtained: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingMark, setSubmittingMark] = useState(false);

  const loadInitialData = async () => {
    setLoadingStudents(true);
    try {
      const studentsData = await api.get('/students');
      const subjectsData = await api.get('/subjects');
      setStudents(studentsData);
      setSubjects(subjectsData);
      
      // Calculate class average GPA/percentage
      const reportsData = await api.get('/marks/reports');
      const gradedReports = reportsData.filter(r => r.subjectsCount > 0);
      if (gradedReports.length > 0) {
        const sum = gradedReports.reduce((acc, curr) => acc + curr.summary.percentage, 0);
        setClassAveragePercentage(Math.round(sum / gradedReports.length));
      }

      if (studentsData.length > 0) {
        setSelectedStudentId(studentsData[0].id);
      }
    } catch (err) {
      setError('Failed to load initial data.');
      toast.error('Failed to load student/subject databases.');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleBulkImport = async () => {
    if (!selectedStudentId) return;
    if (subjects.length === 0) {
      toast.error('Please register subjects first.');
      return;
    }
    setLoading(true);
    try {
      for (const sub of subjects) {
        const randomScore = Math.floor(Math.random() * 46) + 50; // Random 50 - 95
        await api.post('/marks', {
          studentId: parseInt(selectedStudentId, 10),
          subjectId: sub.id,
          marksObtained: randomScore
        });
      }
      toast.success('Bulk marks populated for all subjects!');
      loadStudentReport(selectedStudentId);
      
      // Refresh class average
      const reportsData = await api.get('/marks/reports');
      const gradedReports = reportsData.filter(r => r.subjectsCount > 0);
      if (gradedReports.length > 0) {
        const sum = gradedReports.reduce((acc, curr) => acc + curr.summary.percentage, 0);
        setClassAveragePercentage(Math.round(sum / gradedReports.length));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to populate bulk marks.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentReport = async (studentId) => {
    if (!studentId) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/marks/student/${studentId}`);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to load report card.');
      toast.error('Failed to load student grade report.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentReport(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId);
    setSuccess('');
  };

  const handleOpenAssign = () => {
    setError('');
    setSuccess('');
    setAssignForm({
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      marksObtained: ''
    });
    setIsModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const markVal = parseInt(assignForm.marksObtained, 10);
    if (isNaN(markVal) || markVal < 0 || markVal > 100) {
      setError('Marks must be between 0 and 100.');
      toast.error('Marks must be between 0 and 100.');
      return;
    }

    setSubmittingMark(true);
    try {
      const payload = {
        studentId: parseInt(selectedStudentId, 10),
        subjectId: parseInt(assignForm.subjectId, 10),
        marksObtained: markVal
      };

      await api.post('/marks', payload);
      toast.success('Marks updated successfully.');
      setIsModalOpen(false);
      loadStudentReport(selectedStudentId);
    } catch (err) {
      setError(err.message || 'Failed to assign marks.');
      toast.error(err.message || 'Failed to assign marks.');
    } finally {
      setSubmittingMark(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Grading Dashboard</h1>
        <p className="mt-1 text-xs text-slate-400 font-semibold font-sans">
          Record student test scores, assign grade cards, and review computed academic status sheets.
        </p>
      </div>

      {/* Selector & Class Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Dropdown student selector card */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden md:col-span-2">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-blue-600/5 blur-xl pointer-events-none" />
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Select Active Student Profile
          </label>
          
          {loadingStudents ? (
            <div className="h-12 w-full max-w-md animate-pulse rounded-2xl bg-slate-900 border border-slate-800" />
          ) : students.length === 0 ? (
            <div className="text-xs text-slate-500 font-semibold py-2">
              No student profiles found. Please register students inside the directory index first.
            </div>
          ) : (
            <div className="relative max-w-md">
              <select
                value={selectedStudentId}
                onChange={handleStudentChange}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/45 py-3.5 pl-4 pr-10 text-xs font-bold text-white outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/5 cursor-pointer appearance-none"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id} className="bg-slate-950 text-white font-semibold">
                    {student.firstName} {student.lastName} (Roll: {student.rollNumber}) — {student.class}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Class Average Progress Card */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-indigo-600/5 blur-lg pointer-events-none" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Class Average Progress</span>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">{classAveragePercentage}%</span>
            <span className="text-xs text-slate-500 font-semibold">Passing Ratio</span>
          </div>
          <p className="text-[9px] text-slate-500 font-semibold mt-2">Overall grading metric across registered groups</p>
        </div>
      </div>

      {/* Main stats + table sheet view */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-xs font-semibold tracking-wide text-slate-400">Loading student grades...</p>
          </div>
        </div>
      ) : report ? (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Grade summary counters widgets */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Widget 1: Cumulative Marks */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Marks</span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {report.summary.totalMarks}
                </span>
                <span className="text-xs text-slate-500 font-bold">/ {report.summary.maxMarks}</span>
              </div>
              <p className="mt-2 text-[10px] text-slate-500 font-semibold">Sum of obtained credits</p>
            </div>

            {/* Widget 2: Percentage bar */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Percentage</span>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-white tracking-tight">{report.summary.percentage}%</span>
                <div className="w-full bg-slate-950/65 border border-slate-850 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      report.summary.status === 'Pass' ? 'bg-gradient-to-r from-blue-600 to-indigo-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${report.summary.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Widget 3: Overall Grade */}
            <div className="glass-card-purple rounded-2xl p-5 relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Grade</span>
              <div className="mt-3.5 flex items-center gap-3">
                <span className={`inline-flex rounded-xl font-extrabold px-3.5 py-1 text-2xl ${
                  report.summary.grade === 'F' 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/15' 
                    : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/15'
                }`}>
                  {report.summary.grade}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">Computed scale</span>
              </div>
            </div>

            {/* Widget 4: Status Pass / Fail */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Result Status</span>
              <div className="mt-4">
                <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                  report.summary.status === 'Pass' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {report.summary.status}
                </span>
                <p className="mt-2 text-[10px] text-slate-500 font-semibold">Minimum limit: 40% threshold</p>
              </div>
            </div>

          </div>

          {/* Graded Course Module Breakdown list */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-blue-600/5 blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-extrabold text-white tracking-wide">Course Module Breakdown</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Obtained details per individual subject</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {subjects.length > 0 && report.marks.length < subjects.length && (
                  <button
                    onClick={handleBulkImport}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/45 hover:bg-slate-900/50 px-4 py-2.5 text-xs font-bold text-slate-350 hover:text-white transition-all cursor-pointer"
                  >
                    Auto-Fill Grades
                  </button>
                )}
                {report.marks.length > 0 && (
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/45 hover:bg-slate-900/50 px-4 py-2.5 text-xs font-bold text-slate-350 hover:text-white transition-all cursor-pointer"
                  >
                    Print Transcript
                  </button>
                )}
                <button
                  onClick={handleOpenAssign}
                  disabled={subjects.length === 0}
                  className="glow-button inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4.5 py-2.5 text-xs font-bold text-white shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  Grade / Update Marks
                </button>
              </div>
            </div>

            {report.marks.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-slate-650 mx-auto mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-xs text-slate-400 font-semibold">No graded logs registered for this student profile.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="w-full text-left text-sm text-slate-300 zebra-table">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="pb-3.5 pt-3 px-4">Subject Code</th>
                      <th className="pb-3.5 pt-3 px-4">Subject Name</th>
                      <th className="pb-3.5 pt-3 px-4">Obtained Marks</th>
                      <th className="pb-3.5 pt-3 px-4">Max Marks</th>
                      <th className="pb-3.5 pt-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {report.marks.map((mark) => (
                      <tr key={mark.id} className="transition-colors group">
                        <td className="py-4 px-4 font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                          {mark.Subject.code}
                        </td>
                        <td className="py-4 px-4 text-white font-bold">
                          {mark.Subject.name}
                        </td>
                        <td className="py-4 px-4 font-extrabold text-white text-base">
                          {mark.marksObtained}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-500">
                          {mark.maxMarks}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            mark.marksObtained >= 40 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/15'
                          }`}>
                            {mark.marksObtained >= 40 ? 'Pass' : 'Fail'}
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
      ) : (
        <div className="rounded-2xl border border-slate-850 border-dashed bg-slate-900/5 p-20 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-slate-600 mx-auto mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM1.372 15.753A10.5 10.5 0 0 1 9 12.25c2.327 0 4.512.753 6.302 2.032m-13.93 0c-.397.287-.624.757-.624 1.258V18A2.25 2.25 0 0 0 3 20.25h12A2.25 2.25 0 0 0 17.25 18v-1.02a2.25 2.25 0 0 0-.624-1.258" />
          </svg>
          <p className="text-xs text-slate-400 font-semibold">Select a student from the dropdown header to display academic grading report cards.</p>
        </div>
      )}

      {/* MODAL DIALOG: Assign marks form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0c0d16]/95 p-8 shadow-2xl relative overflow-hidden animate-scaleIn">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-white tracking-wide">Assign / Edit Marks</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800/85 hover:text-white transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300 font-semibold animate-fadeIn flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-rose-400 shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Subject Module
                </label>
                <div className="relative">
                  <select
                    value={assignForm.subjectId}
                    onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 px-4 text-xs font-semibold text-white outline-none transition-all focus:border-blue-500/50 focus:bg-slate-950 cursor-pointer appearance-none"
                  >
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id} className="bg-slate-950 text-white font-semibold">
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Marks Obtained (0 - 100)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    placeholder="e.g. 85"
                    value={assignForm.marksObtained}
                    onChange={(e) => setAssignForm({ ...assignForm, marksObtained: e.target.value })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMark}
                  className="glow-button rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg cursor-pointer"
                >
                  {submittingMark ? 'Saving...' : 'Save Marks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

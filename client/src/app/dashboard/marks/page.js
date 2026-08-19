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
    <div className="space-y-6 saas-fade-in">
      {/* Header title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Grading Dashboard</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Record student test scores, assign grade cards, and review computed academic status sheets.
        </p>
      </div>

      {/* Selector & Class Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Dropdown student selector card */}
        <div className="saas-card p-6 bg-[#09090b] md:col-span-2">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            Select Active Student Profile
          </label>
          
          {loadingStudents ? (
            <div className="h-10 w-full max-w-md animate-pulse rounded border border-zinc-800 bg-zinc-900/20" />
          ) : students.length === 0 ? (
            <div className="text-xs text-zinc-500 py-2">
              No student profiles found. Please register students inside the directory index first.
            </div>
          ) : (
            <div className="relative max-w-md">
              <select
                value={selectedStudentId}
                onChange={handleStudentChange}
                className="saas-input w-full pr-8 py-2 text-xs cursor-pointer appearance-none"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id} className="bg-zinc-950 text-white font-semibold">
                    {student.firstName} {student.lastName} (Roll: {student.rollNumber}) — {student.class}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Class Average Progress Card */}
        <div className="saas-card p-6 bg-[#09090b] flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Class Average</span>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white tracking-tight">{classAveragePercentage}%</span>
            <span className="text-[10px] text-zinc-500">Passing Ratio</span>
          </div>
          <p className="text-[9px] text-zinc-500 mt-2">Overall grading metric across registered groups</p>
        </div>
      </div>

      {/* Main stats + table sheet view */}
      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-xs text-zinc-400">Loading student grades...</p>
          </div>
        </div>
      ) : report ? (
        <div className="space-y-6 saas-fade-in">
          
          {/* Grade summary counters widgets */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Widget 1: Cumulative Marks */}
            <div className="saas-card p-4 bg-[#09090b]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total Marks</span>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tracking-tight font-mono">
                  {report.summary.totalMarks}
                </span>
                <span className="text-xs text-zinc-550">/ {report.summary.maxMarks}</span>
              </div>
              <p className="mt-1 text-[9px] text-zinc-550">Sum of obtained credits</p>
            </div>

            {/* Widget 2: Percentage bar */}
            <div className="saas-card p-4 bg-[#09090b]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Percentage</span>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white tracking-tight font-mono">{report.summary.percentage}%</span>
                <div className="w-full bg-zinc-900 border border-zinc-800 h-1.5 rounded mt-2 overflow-hidden">
                  <div
                    className={`saas-progress-bar h-full transition-all duration-300 ${
                      report.summary.status === 'Pass' ? 'bg-blue-600' : 'bg-red-500'
                    }`}
                    style={{ width: `${report.summary.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Widget 3: Overall Grade */}
            <div className="saas-card p-4 bg-[#09090b]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Final Grade</span>
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex rounded font-bold px-2 py-0.5 text-lg border ${
                  report.summary.grade === 'F' 
                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}>
                  {report.summary.grade}
                </span>
                <span className="text-[9px] text-zinc-555">Computed scale</span>
              </div>
            </div>

            {/* Widget 4: Status Pass / Fail */}
            <div className="saas-card p-4 bg-[#09090b]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Result Status</span>
              <div className="mt-3">
                <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                  report.summary.status === 'Pass' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {report.summary.status}
                </span>
                <p className="mt-1 text-[9px] text-zinc-550">Minimum 40% threshold</p>
              </div>
            </div>

          </div>

          {/* Graded Course Module Breakdown list */}
          <div className="saas-card p-6 bg-[#09090b]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Course Module Breakdown</h2>
                <p className="text-[10px] text-zinc-500 mt-0.5">Obtained details per individual subject</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {subjects.length > 0 && report.marks.length < subjects.length && (
                  <button
                    onClick={handleBulkImport}
                    className="saas-btn-secondary px-3 py-1.5 text-xs border-zinc-800 hover:border-zinc-700"
                  >
                    Auto-Fill Grades
                  </button>
                )}
                {report.marks.length > 0 && (
                  <button
                    onClick={handlePrint}
                    className="saas-btn-secondary px-3 py-1.5 text-xs border-zinc-800 hover:border-zinc-700"
                  >
                    Print Transcript
                  </button>
                )}
                <button
                  onClick={handleOpenAssign}
                  disabled={subjects.length === 0}
                  className="saas-btn-primary px-3 py-1.5 text-xs"
                >
                  Grade / Update Marks
                </button>
              </div>
            </div>

            {report.marks.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded bg-zinc-950/20">
                <p className="text-xs text-zinc-500">No graded logs registered for this student profile.</p>
              </div>
            ) : (
              <div className="saas-table-container">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Obtained Marks</th>
                      <th>Max Marks</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.marks.map((mark) => (
                      <tr key={mark.id}>
                        <td className="font-mono font-bold text-white">
                          {mark.Subject.code}
                        </td>
                        <td className="text-white font-bold">
                          {mark.Subject.name}
                        </td>
                        <td className="font-mono font-bold text-white text-base">
                          {mark.marksObtained}
                        </td>
                        <td className="font-medium text-zinc-500">
                          {mark.maxMarks}
                        </td>
                        <td>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase border ${
                            mark.marksObtained >= 40 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
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
        <div className="border border-zinc-800 border-dashed bg-zinc-950/5 p-16 text-center rounded-lg">
          <p className="text-xs text-zinc-500">Select a student from the dropdown header to display academic grading report cards.</p>
        </div>
      )}

      {/* MODAL DIALOG: Assign marks form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm saas-fade-in">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#09090b] p-6 shadow-2xl relative overflow-hidden">
            
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-bold text-white tracking-tight">Assign / Edit Marks</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-4.5 w-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 text-red-400 shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Select Subject Module
                </label>
                <div className="relative">
                  <select
                    value={assignForm.subjectId}
                    onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
                    className="saas-input w-full pr-8 py-2 text-xs cursor-pointer appearance-none"
                  >
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id} className="bg-zinc-950 text-white font-semibold">
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Marks Obtained (0 - 100)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  placeholder="e.g. 85"
                  value={assignForm.marksObtained}
                  onChange={(e) => setAssignForm({ ...assignForm, marksObtained: e.target.value })}
                  className="saas-input w-full py-1.5 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="saas-btn-secondary py-1.5 px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMark}
                  className="saas-btn-primary py-1.5 px-3 text-xs"
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

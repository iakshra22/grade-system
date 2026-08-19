'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../utils/api';
import { useToast } from '../../../components/Toast';
import ConfirmModal from '../../../components/ConfirmModal';

export default function StudentsPage() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering & Pagination State
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // If non-null, editing student
  const [form, setForm] = useState({
    rollNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    class: ''
  });

  // Custom Delete Confirmation State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [studentReportData, setStudentReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [promotedStatus, setPromotedStatus] = useState({});

  const openStudentProfile = async (student) => {
    setSelectedStudentProfile(student);
    setProfileModalOpen(true);
    setLoadingReport(true);
    setStudentReportData(null);
    try {
      const data = await api.get(`/marks/student/${student.id}`);
      setStudentReportData(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load student grading report.');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleSendEmail = (email) => {
    toast.success(`Emailed report card to ${email || 'student email address'}`);
  };

  const togglePromotion = (studentId) => {
    const current = promotedStatus[studentId] || 'Enrolled';
    let next = 'Enrolled';
    if (current === 'Enrolled') next = 'Promoted';
    else if (current === 'Promoted') next = 'Graduated';
    
    const updated = { ...promotedStatus, [studentId]: next };
    setPromotedStatus(updated);
    toast.success(`Status updated to: ${next}`);
  };

  const loadStudents = async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query ? `/students/search?query=${encodeURIComponent(query)}` : '/students';
      const data = await api.get(endpoint);
      setStudents(data);
      setCurrentPage(1); // Reset page on new load
    } catch (err) {
      setError('Failed to fetch students. Please try again.');
      toast.error('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    loadStudents(val);
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({
      rollNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      class: ''
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditId(student.id);
    setForm({
      rollNumber: student.rollNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || '',
      class: student.class
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const triggerDeleteConfirm = (id) => {
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteExecute = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/students/${deleteTargetId}`);
      toast.success('Student record deleted successfully.');
      loadStudents(searchQuery);
    } catch (err) {
      toast.error(err.message || 'Failed to delete student.');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic email validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Invalid email address format.');
      toast.error('Invalid email address format.');
      return;
    }

    try {
      if (editId) {
        // Edit student
        await api.put(`/students/${editId}`, form);
        toast.success('Student profile updated successfully.');
      } else {
        // Add student
        await api.post('/students', form);
        toast.success('New student profile registered successfully.');
      }
      setIsModalOpen(false);
      loadStudents(searchQuery);
    } catch (err) {
      setError(err.message || 'Failed to save student.');
      toast.error(err.message || 'Failed to save student.');
    }
  };

  // Extract unique classes dynamically for filtering dropdown
  const classesList = ['All', ...new Set(students.map((student) => student.class))].filter(Boolean);

  // Filter students by selected class
  const filteredStudents = students.filter((student) => {
    if (selectedClassFilter === 'All') return true;
    return student.class === selectedClassFilter;
  });

  // Paginated students chunk
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudentsList = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6 saas-fade-in">
      {/* Header title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Student Directory</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Manage academic enrollments, edit information, and filter student directory indexes.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="saas-btn-primary py-2 text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Register Student
        </button>
      </div>

      {/* Directory Filter & Search Panel */}
      <div className="saas-card p-6 bg-[#09090b]">
        
        {/* Filters and Inputs Header */}
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          {/* Search box with icon */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search student names, roll codes..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="saas-input w-full !pl-9 py-2 text-xs"
            />
          </div>

          {/* Dynamic Class Filter Dropdown */}
          <div className="relative min-w-[160px]">
            <select
              value={selectedClassFilter}
              onChange={(e) => { setSelectedClassFilter(e.target.value); setCurrentPage(1); }}
              className="saas-input w-full pr-8 py-2 text-xs cursor-pointer appearance-none"
            >
              {classesList.map((cls) => (
                <option key={cls} value={cls} className="bg-zinc-950 text-zinc-300">
                  {cls === 'All' ? 'All Classes' : `Class: ${cls}`}
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

        {/* Directory Table View */}
        {loading && students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-xs text-zinc-400 mt-2">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-800 rounded-lg bg-zinc-950/20">
            <p className="text-xs text-zinc-500 font-medium">No students found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Roll Code</th>
                    <th>Full Name</th>
                    <th>Class</th>
                    <th>Email Contact</th>
                    <th className="text-right">Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudentsList.map((student) => (
                    <tr key={student.id}>
                      <td className="font-mono font-bold text-white">
                        {student.rollNumber}
                      </td>
                      <td className="text-white font-bold">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="font-medium text-zinc-400">
                        {student.class}
                      </td>
                      <td className="text-zinc-500">
                        {student.email || '—'}
                      </td>
                      <td className="text-right space-x-2">
                        <button
                          onClick={() => openStudentProfile(student)}
                          className="saas-btn-secondary px-2 py-1 text-[11px] h-7 border-zinc-800 hover:border-zinc-700"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="saas-btn-secondary px-2 py-1 text-[11px] h-7 border-zinc-800 hover:border-zinc-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => triggerDeleteConfirm(student.id)}
                          className="saas-btn-danger px-2 py-1 text-[11px] h-7"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-800 pt-4 gap-4">
                <span className="text-[11px] text-zinc-500">
                  Showing <span className="text-zinc-300 font-bold">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="text-zinc-300 font-bold">
                    {Math.min(indexOfLastItem, filteredStudents.length)}
                  </span>{' '}
                  of <span className="text-zinc-300 font-bold">{filteredStudents.length}</span> students
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="saas-btn-secondary px-2.5 py-1 text-[11px] h-7 disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`h-7 w-7 text-xs font-bold rounded transition-colors ${
                          currentPage === index + 1
                            ? 'bg-blue-600 text-white'
                            : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/20 border border-zinc-800'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="saas-btn-secondary px-2.5 py-1 text-[11px] h-7 disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DIALOG: Register / Edit Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm saas-fade-in">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-[#09090b] p-6 shadow-2xl relative overflow-hidden">
            
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-bold text-white tracking-tight">
                {editId ? 'Modify Student Details' : 'Register New Student'}
              </h2>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Roll Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STU1024"
                  value={form.rollNumber}
                  disabled={!!editId}
                  onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                  className="saas-input w-full py-1.5 text-xs disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyan"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="saas-input w-full py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patel"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="saas-input w-full py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Class / Group
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10A"
                  value={form.class}
                  onChange={(e) => setForm({ ...form, class: e.target.value })}
                  className="saas-input w-full py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. student@school.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="saas-input w-full py-1.5 text-xs"
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
                  className="saas-btn-primary py-1.5 px-3 text-xs"
                >
                  {editId ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRM DIALOG MODAL */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteExecute}
        title="Confirm Student Deletion"
        message="Are you sure you want to delete this student profile? This will cascade-delete all marks records assigned to this student."
        confirmText="Confirm Delete"
        cancelText="Keep Student"
      />

      {/* STUDENT PROFILE DETAILS MODAL */}
      {profileModalOpen && selectedStudentProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm saas-fade-in">
          <div className="w-full max-w-xl rounded-lg border border-zinc-800 bg-[#09090b] p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-zinc-805 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-white">
                  {selectedStudentProfile.firstName[0]}{selectedStudentProfile.lastName[0]}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{selectedStudentProfile.firstName} {selectedStudentProfile.lastName}</h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Roll Code: <span className="font-mono text-blue-500">{selectedStudentProfile.rollNumber}</span> | Group: {selectedStudentProfile.class}</p>
                </div>
              </div>
              <button 
                onClick={() => setProfileModalOpen(false)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-900 transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Meta Cards */}
            <div className="grid gap-3 sm:grid-cols-3 mb-5">
              <div className="p-3 rounded border border-zinc-800 bg-zinc-950/20">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">Status</span>
                <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold border ${
                  (promotedStatus[selectedStudentProfile.id] || 'Enrolled') === 'Graduated' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : (promotedStatus[selectedStudentProfile.id] || 'Enrolled') === 'Promoted'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  {promotedStatus[selectedStudentProfile.id] || 'Enrolled'}
                </span>
                <button 
                  onClick={() => togglePromotion(selectedStudentProfile.id)}
                  className="block mt-1.5 text-[9px] text-blue-500 hover:text-blue-450 font-semibold cursor-pointer"
                >
                  Change Status →
                </button>
              </div>

              <div className="p-3 rounded border border-zinc-800 bg-zinc-950/20 sm:col-span-2">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">Email Contact</span>
                <span className="text-xs text-zinc-300 font-semibold block truncate">{selectedStudentProfile.email || 'No email registered'}</span>
                {selectedStudentProfile.email && (
                  <button 
                    onClick={() => handleSendEmail(selectedStudentProfile.email)}
                    className="inline-flex items-center gap-1 mt-1.5 text-[9px] text-blue-500 hover:text-blue-450 font-semibold cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Email Report Card
                  </button>
                )}
              </div>
            </div>

            {/* Academic Report Card Details */}
            <div>
              <h3 className="text-xs font-bold text-white mb-2.5 uppercase tracking-wider">Report Card Details</h3>
              
              {loadingReport ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <p className="text-[10px] text-zinc-550 mt-2">Fetching report card...</p>
                </div>
              ) : !studentReportData || !studentReportData.marks || studentReportData.marks.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-zinc-800 rounded bg-zinc-950/10">
                  <p className="text-xs text-zinc-500">No grades recorded for this student.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary row */}
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                    <div className="p-2 rounded border border-zinc-800 bg-[#09090b] text-center">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase block">Percentage</span>
                      <span className="text-sm font-bold text-white">{studentReportData.summary.percentage}%</span>
                    </div>
                    <div className="p-2 rounded border border-zinc-800 bg-[#09090b] text-center">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase block">Final Grade</span>
                      <span className={`text-sm font-bold ${studentReportData.summary.grade === 'F' ? 'text-red-400' : 'text-blue-500'}`}>
                        {studentReportData.summary.grade}
                      </span>
                    </div>
                    <div className="p-2 rounded border border-zinc-800 bg-[#09090b] text-center">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase block">Status</span>
                      <span className={`text-xs font-bold uppercase tracking-wider block ${studentReportData.summary.status === 'Pass' ? 'text-emerald-450' : 'text-red-405'}`}>
                        {studentReportData.summary.status}
                      </span>
                    </div>
                    <div className="p-2 rounded border border-zinc-800 bg-[#09090b] text-center">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase block">Marks Ratio</span>
                      <span className="text-xs font-bold text-white block mt-0.5">
                        {studentReportData.summary.totalMarks}/{studentReportData.summary.maxMarks}
                      </span>
                    </div>
                  </div>

                  {/* Marks details table */}
                  <div className="saas-table-container">
                    <table className="saas-table">
                      <thead>
                        <tr>
                          <th>Subject Code</th>
                          <th>Subject Name</th>
                          <th>Score</th>
                          <th className="text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentReportData.marks.map((m) => (
                          <tr key={m.id}>
                            <td className="font-mono font-bold text-white">{m.Subject.code}</td>
                            <td className="text-zinc-300 font-medium">{m.Subject.name}</td>
                            <td className="font-bold text-white">{m.marksObtained} / {m.maxMarks || 100}</td>
                            <td className="text-right">
                              <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                m.marksObtained >= 40 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {m.marksObtained >= 40 ? 'Pass' : 'Fail'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-2 mt-5 border-t border-zinc-800 pt-4">
              <button 
                onClick={() => setProfileModalOpen(false)}
                className="saas-btn-secondary py-1.5 px-3 text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

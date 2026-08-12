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
    <div className="space-y-8 animate-fadeIn">
      {/* Header title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Student Directory</h1>
          <p className="mt-1 text-xs text-slate-400 font-semibold">
            Manage academic enrollments, edit information, and filter student directory indexes.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="glow-button inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Register New Student
        </button>
      </div>

      {/* Directory Filter & Search Panel */}
      <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden">
        
        {/* Filters and Inputs Header */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search box with icon */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search student names, roll codes..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-2xl border border-slate-800/80 bg-slate-950/45 py-3 pl-11 pr-4 text-xs font-semibold text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-slate-950/80 focus:ring-4 focus:ring-blue-500/5"
            />
          </div>

          {/* Dynamic Class Filter Dropdown */}
          <div className="relative min-w-[160px]">
            <select
              value={selectedClassFilter}
              onChange={(e) => { setSelectedClassFilter(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-2xl border border-slate-800/80 bg-slate-950/45 py-3.5 px-4 pr-10 text-xs font-semibold text-white outline-none transition-all focus:border-blue-500/50 cursor-pointer appearance-none"
            >
              {classesList.map((cls) => (
                <option key={cls} value={cls} className="bg-slate-950 text-slate-300">
                  {cls === 'All' ? 'Filter: All Classes' : `Class: ${cls}`}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Directory Table View */}
        {loading && students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-sm font-semibold text-slate-400 mt-3 tracking-wide">Loading indexes...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-950/20 rounded-xl border border-slate-850">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-slate-600 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <p className="text-xs text-slate-400 font-semibold tracking-wide">No students found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="table-container">
              <table className="w-full text-left text-sm text-slate-300 zebra-table">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="pb-3.5 pt-3 px-4">Roll Code</th>
                    <th className="pb-3.5 pt-3 px-4">Full Name</th>
                    <th className="pb-3.5 pt-3 px-4">Class</th>
                    <th className="pb-3.5 pt-3 px-4">Email Contact</th>
                    <th className="pb-3.5 pt-3 px-4 text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {currentStudentsList.map((student) => (
                    <tr key={student.id} className="transition-colors group">
                      <td className="py-4 px-4 font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                        {student.rollNumber}
                      </td>
                      <td className="py-4 px-4 text-white font-bold">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-400">
                        {student.class}
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
                        {student.email || '—'}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2.5">
                        <button
                          onClick={() => openStudentProfile(student)}
                          className="rounded-xl border border-slate-800 bg-slate-950/20 hover:bg-slate-900/50 px-3 py-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-all cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer hover:border-blue-500/30"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => triggerDeleteConfirm(student.id)}
                          className="rounded-xl border border-red-500/10 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 transition-all cursor-pointer"
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
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-4 gap-4">
                <span className="text-xs text-slate-500 font-semibold">
                  Showing <span className="text-slate-300 font-bold">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="text-slate-300 font-bold">
                    {Math.min(indexOfLastItem, filteredStudents.length)}
                  </span>{' '}
                  of <span className="text-slate-300 font-bold">{filteredStudents.length}</span> students
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-slate-800 bg-slate-950/20 px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1.5 px-1.5">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`h-8 w-8 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          currentPage === index + 1
                            ? 'bg-blue-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200 bg-slate-950/20 border border-slate-850'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-slate-800 bg-slate-950/20 px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0c0d16]/95 p-8 shadow-2xl relative overflow-hidden animate-scaleIn">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                {editId ? 'Modify Student Details' : 'Register New Student'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer"
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Roll Code (Unique)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU1024"
                    value={form.rollNumber}
                    disabled={!!editId} // Typically lock key fields on edit
                    onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 outline-none transition-all focus:border-blue-500/50 focus:bg-slate-950 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyan"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 px-4 text-xs font-semibold text-white placeholder-slate-650 outline-none transition-all focus:border-blue-500/50 focus:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patel"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 px-4 text-xs font-semibold text-white placeholder-slate-650 outline-none transition-all focus:border-blue-500/50 focus:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Academic Class / Group
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A5.905 5.905 0 011.75 4.868.75.75 0 012.25 4h19.5a.75.75 0 01.5.868 5.905 5.905 0 01-1.382 4.466 50.56 50.56 0 00-2.658.813m-11.721 0A50.709 50.709 0 0112 11.25c2.107 0 4.135-.13 6.121-.383m-12.013 0.383c-.021.258-.032.52-.032.784 0 3.01 2.378 5.484 5.378 5.5h.084a5.5 5.5 0 0 0 5.378-5.5c0-.264-.011-.526-.032-.784m-11.721 0A50.71 50.71 0 0012 11.25c2.107 0 4.135-.13 6.121-.383" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 10A"
                    value={form.class}
                    onChange={(e) => setForm({ ...form, class: e.target.value })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-650 outline-none transition-all focus:border-blue-500/50 focus:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="e.g. student@school.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-650 outline-none transition-all focus:border-blue-500/50 focus:bg-slate-950"
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
                  className="glow-button rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#070b1e]/95 p-6 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-5 mb-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {selectedStudentProfile.firstName[0]}{selectedStudentProfile.lastName[0]}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">{selectedStudentProfile.firstName} {selectedStudentProfile.lastName}</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Roll Code: <span className="font-mono text-blue-400">{selectedStudentProfile.rollNumber}</span> | Group: {selectedStudentProfile.class}</p>
                </div>
              </div>
              <button 
                onClick={() => setProfileModalOpen(false)}
                className="rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 p-2 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Meta Cards */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="p-4 rounded-2xl bg-slate-950/45 border border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Status</span>
                <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                  (promotedStatus[selectedStudentProfile.id] || 'Enrolled') === 'Graduated' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                    : (promotedStatus[selectedStudentProfile.id] || 'Enrolled') === 'Promoted'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15'
                }`}>
                  {promotedStatus[selectedStudentProfile.id] || 'Enrolled'}
                </span>
                <button 
                  onClick={() => togglePromotion(selectedStudentProfile.id)}
                  className="block mt-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                >
                  Change Status →
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/45 border border-slate-800/80 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Email Address</span>
                <span className="text-xs text-slate-200 font-bold block truncate">{selectedStudentProfile.email || 'No email registered'}</span>
                {selectedStudentProfile.email && (
                  <button 
                    onClick={() => handleSendEmail(selectedStudentProfile.email)}
                    className="inline-flex items-center gap-1 mt-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
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
              <h3 className="text-sm font-extrabold text-white mb-3">Academic Performance Card</h3>
              
              {loadingReport ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  <p className="text-xs text-slate-500 mt-2 font-bold">Fetching report card...</p>
                </div>
              ) : !studentReportData || !studentReportData.marks || studentReportData.marks.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/10">
                  <p className="text-xs text-slate-500 font-semibold">No grades recorded for this student yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary row */}
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                    <div className="p-3 rounded-xl bg-slate-950/20 border border-slate-850 text-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Percentage</span>
                      <span className="text-base font-extrabold text-white">{studentReportData.summary.percentage}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/20 border border-slate-850 text-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Final Grade</span>
                      <span className={`text-base font-extrabold ${studentReportData.summary.grade === 'F' ? 'text-red-400' : 'text-indigo-400'}`}>
                        {studentReportData.summary.grade}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/20 border border-slate-850 text-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Status</span>
                      <span className={`text-sm font-bold uppercase tracking-wider block ${studentReportData.summary.status === 'Pass' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {studentReportData.summary.status}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/20 border border-slate-850 text-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Marks Ratio</span>
                      <span className="text-xs font-extrabold text-white mt-1 block">
                        {studentReportData.summary.totalMarks} / {studentReportData.summary.maxMarks}
                      </span>
                    </div>
                  </div>

                  {/* Marks details table */}
                  <div className="table-container border border-slate-850 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-350">
                      <thead>
                        <tr className="bg-slate-950/60 border-b border-slate-850 font-bold uppercase text-[9px] text-slate-500">
                          <th className="p-3">Subject Code</th>
                          <th className="p-3">Subject Name</th>
                          <th className="p-3">Score</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/40">
                        {studentReportData.marks.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-950/10">
                            <td className="p-3 font-mono font-bold text-white">{m.Subject.code}</td>
                            <td className="p-3 font-semibold text-slate-300">{m.Subject.name}</td>
                            <td className="p-3 font-extrabold text-white">{m.marksObtained} / {m.maxMarks || 100}</td>
                            <td className="p-3 text-right">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
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
            <div className="flex justify-end gap-3 mt-6 border-t border-slate-800/80 pt-4">
              <button 
                onClick={() => setProfileModalOpen(false)}
                className="rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
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

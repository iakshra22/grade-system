'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../utils/api';
import { useToast } from '../../../components/Toast';
import ConfirmModal from '../../../components/ConfirmModal';

export default function SubjectsPage() {
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [form, setForm] = useState({
    code: '',
    name: ''
  });

  // Custom Delete Confirm State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await api.get('/subjects');
      setSubjects(data);
    } catch (err) {
      setError('Failed to fetch subjects. Please try again.');
      toast.error('Failed to fetch subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const triggerDeleteConfirm = (id) => {
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteExecute = async () => {
    if (!deleteTargetId) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/subjects/${deleteTargetId}`);
      toast.success('Subject deleted successfully.');
      loadSubjects();
    } catch (err) {
      setError(err.message || 'Failed to delete subject.');
      toast.error(err.message || 'Failed to delete subject.');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/subjects', form);
      toast.success('Subject created successfully.');
      setForm({ code: '', name: '' });
      loadSubjects();
    } catch (err) {
      setError(err.message || 'Failed to create subject.');
      toast.error(err.message || 'Failed to create subject.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Subject Directory</h1>
        <p className="mt-1 text-xs text-slate-400 font-semibold">
          Create academic course modules, subject codes, and manage subject parameters.
        </p>
      </div>

      {/* Grid: Form on Left, Table on Right */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* ADD SUBJECT FORM CARD (1/3 width) */}
        <div className="glass-card rounded-2xl p-6 h-fit relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-blue-600/5 blur-xl pointer-events-none" />
          <h2 className="text-base font-extrabold text-white mb-6 tracking-wide">Add New Subject</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Subject Code
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. MATH101"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/5"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Subject Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-slate-950 focus:ring-4 focus:ring-blue-500/5"
                />
              </div>
            </div>

            <button
              type="submit"
              className="glow-button w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg cursor-pointer"
            >
              Register Subject
            </button>
          </form>
        </div>

        {/* SUBJECTS DIRECTORY CARD TABLE (2/3 width) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-indigo-600/5 blur-2xl pointer-events-none" />
          <h2 className="text-base font-extrabold text-white mb-6 tracking-wide">Registered Modules</h2>

          {loading && subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-xs font-semibold text-slate-400 mt-3 tracking-wide">Loading subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/20 rounded-2xl border border-slate-850">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-slate-650 mx-auto mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292" />
              </svg>
              <p className="text-xs text-slate-400 font-semibold tracking-wide">No course modules registered yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="w-full text-left text-sm text-slate-300 zebra-table">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="pb-3.5 pt-3 px-4">Subject Code</th>
                    <th className="pb-3.5 pt-3 px-4">Subject Name</th>
                    <th className="pb-3.5 pt-3 px-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="transition-colors group">
                      <td className="py-4 px-4 font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                        {subject.code}
                      </td>
                      <td className="py-4 px-4 text-white font-bold text-base">
                        {subject.name}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => triggerDeleteConfirm(subject.id)}
                          className="rounded-xl border border-red-500/10 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRMATION WARNING MODAL */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteExecute}
        title="Confirm Subject Deletion"
        message="Are you sure you want to delete this subject module? Delete operation will cascadingly wipe all graded students records for this subject code."
        confirmText="Confirm Delete"
        cancelText="Keep Subject"
      />
    </div>
  );
}

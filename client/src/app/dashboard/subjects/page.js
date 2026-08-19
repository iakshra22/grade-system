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
    <div className="space-y-6 saas-fade-in">
      {/* Header title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Subject Directory</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Create academic course modules, subject codes, and manage subject parameters.
        </p>
      </div>

      {/* Grid: Form on Left, Table on Right */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* ADD SUBJECT FORM CARD (1/3 width) */}
        <div className="saas-card p-6 h-fit bg-[#09090b]">
          <h2 className="text-sm font-bold text-white mb-5 tracking-tight">Add New Subject</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Subject Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MATH101"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="saas-input w-full py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Subject Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mathematics"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="saas-input w-full py-1.5 text-xs"
              />
            </div>

            <button
              type="submit"
              className="saas-btn-primary w-full py-2 text-xs mt-2"
            >
              Register Subject
            </button>
          </form>
        </div>

        {/* SUBJECTS DIRECTORY CARD TABLE (2/3 width) */}
        <div className="lg:col-span-2 saas-card p-6 bg-[#09090b]">
          <h2 className="text-sm font-bold text-white mb-5 tracking-tight">Registered Modules</h2>

          {loading && subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-xs text-zinc-450 mt-2">Loading subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12 bg-zinc-950/20 rounded-lg border border-zinc-800">
              <p className="text-xs text-zinc-500">No course modules registered yet.</p>
            </div>
          ) : (
            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Name</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td className="font-mono font-bold text-white">
                        {subject.code}
                      </td>
                      <td className="text-white font-bold">
                        {subject.name}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => triggerDeleteConfirm(subject.id)}
                          className="saas-btn-danger px-3 py-1 text-[11px] h-7"
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

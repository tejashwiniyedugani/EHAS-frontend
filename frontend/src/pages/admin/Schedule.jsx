import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const empty = { subject_id: '', exam_date: '', start_time: '', end_time: '' };

export default function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [sched, subs] = await Promise.all([api.get('/schedule'), api.get('/subjects')]);
      setSchedules(sched.data);
      setSubjects(subs.data);
    } catch { toast.error('Failed to load data'); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) { await api.put(`/schedule/${editId}`, form); toast.success('Schedule updated!'); }
      else { await api.post('/schedule', form); toast.success('Schedule added!'); }
      setForm(empty); setEditId(null); setShowForm(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try { await api.delete(`/schedule/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📅 Exam Schedule</h1>
          <button onClick={() => { setShowForm(!showForm); setForm(empty); setEditId(null); }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
            {showForm ? 'Cancel' : '+ Add Schedule'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>)}
              </select>
            </div>
            {[['exam_date','Exam Date','date'], ['start_time','Start Time','time'], ['end_time','End Time','time']].map(([f,l,t]) => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                <input type={t} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <button type="submit" disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                {loading ? 'Saving...' : editId ? 'Update' : 'Add Schedule'}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-orange-50">
              <tr>{['Subject', 'Date', 'Time', 'Dept', 'Sem', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {schedules.length === 0
                ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No schedules yet</td></tr>
                : schedules.map(s => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.subject_name}<br /><span className="text-xs text-gray-400">{s.subject_code}</span></td>
                    <td className="px-4 py-3">{new Date(s.exam_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{s.start_time} – {s.end_time}</td>
                    <td className="px-4 py-3">{s.department || '-'}</td>
                    <td className="px-4 py-3">{s.semester || '-'}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button onClick={() => { setForm({ subject_id: String(s.subject_id), exam_date: s.exam_date?.split('T')[0], start_time: s.start_time, end_time: s.end_time }); setEditId(s.id); setShowForm(true); }} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

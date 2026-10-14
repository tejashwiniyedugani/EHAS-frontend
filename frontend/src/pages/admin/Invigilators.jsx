import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const empty = { name: '', email: '', phone: '', department: '' };

export default function Invigilators() {
  const [invigilators, setInvigilators] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Assignment state
  const [schedules, setSchedules] = useState([]);
  const [halls, setHalls] = useState([]);
  const [assign, setAssign] = useState({ schedule_id: '', hall_id: '', invigilator_id: '' });
  const [showAssign, setShowAssign] = useState(false);
  const [assignments, setAssignments] = useState([]);

  const fetchAll = async () => {
    try {
      const [inv, sched, halls] = await Promise.all([
        api.get('/invigilators'), api.get('/schedule'), api.get('/halls')
      ]);
      setInvigilators(inv.data); setSchedules(sched.data); setHalls(halls.data);
    } catch { toast.error('Failed to load data'); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editId) { await api.put(`/invigilators/${editId}`, form); toast.success('Updated!'); }
      else { await api.post('/invigilators', form); toast.success('Invigilator added!'); }
      setForm(empty); setEditId(null); setShowForm(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/invigilators/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/invigilators/assign', assign);
      toast.success('Invigilator assigned!');
      if (assign.schedule_id) {
        const res = await api.get(`/invigilators/assignments/${assign.schedule_id}`);
        setAssignments(res.data);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const loadAssignments = async (scheduleId) => {
    try { const res = await api.get(`/invigilators/assignments/${scheduleId}`); setAssignments(res.data); }
    catch { toast.error('Failed to load assignments'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">👤 Invigilators</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowAssign(!showAssign)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium">
              {showAssign ? 'Hide Assignment' : 'Assign to Hall'}
            </button>
            <button onClick={() => { setShowForm(!showForm); setForm(empty); setEditId(null); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
              {showForm ? 'Cancel' : '+ Add'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['name','Name'], ['email','Email'], ['phone','Phone'], ['department','Department']].map(([f,l]) => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                <input value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required={['name','email'].includes(f)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                {loading ? 'Saving...' : editId ? 'Update' : 'Add Invigilator'}
              </button>
            </div>
          </form>
        )}

        {showAssign && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Assign Invigilator to Hall</h2>
            <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Schedule</label>
                <select value={assign.schedule_id} onChange={(e) => { setAssign({ ...assign, schedule_id: e.target.value }); loadAssignments(e.target.value); }} required
                  className="w-full border rounded-lg px-3 py-2">
                  <option value="">Select Schedule</option>
                  {schedules.map(s => <option key={s.id} value={s.id}>{s.subject_name} – {new Date(s.exam_date).toLocaleDateString()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hall</label>
                <select value={assign.hall_id} onChange={(e) => setAssign({ ...assign, hall_id: e.target.value })} required
                  className="w-full border rounded-lg px-3 py-2">
                  <option value="">Select Hall</option>
                  {halls.map(h => <option key={h.id} value={h.id}>{h.hall_name} ({h.hall_number})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invigilator</label>
                <select value={assign.invigilator_id} onChange={(e) => setAssign({ ...assign, invigilator_id: e.target.value })} required
                  className="w-full border rounded-lg px-3 py-2">
                  <option value="">Select Invigilator</option>
                  {invigilators.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium mt-4">Assign</button>
              </div>
            </form>

            {assignments.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">Current Assignments:</h3>
                <div className="space-y-2">
                  {assignments.map(a => (
                    <div key={a.id} className="flex gap-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                      <span>🏛️ {a.hall_name} ({a.hall_number})</span>
                      <span>→ 👤 {a.invigilator_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-50">
              <tr>{['Name', 'Email', 'Phone', 'Department', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {invigilators.length === 0
                ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">No invigilators yet</td></tr>
                : invigilators.map(i => (
                  <tr key={i.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{i.name}</td>
                    <td className="px-4 py-3">{i.email}</td>
                    <td className="px-4 py-3">{i.phone || '-'}</td>
                    <td className="px-4 py-3">{i.department || '-'}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button onClick={() => { setForm({ name: i.name, email: i.email, phone: i.phone || '', department: i.department || '' }); setEditId(i.id); setShowForm(true); }} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(i.id)} className="text-red-500 hover:underline">Delete</button>
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

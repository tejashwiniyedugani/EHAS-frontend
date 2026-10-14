import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const empty = { hall_name: '', hall_number: '', capacity: '', building: '', floor: 0, is_available: true };

export default function Halls() {
  const [halls, setHalls] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHalls = async () => {
    try { const res = await api.get('/halls'); setHalls(res.data); }
    catch { toast.error('Failed to load halls'); }
  };

  useEffect(() => { fetchHalls(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) { await api.put(`/halls/${editId}`, form); toast.success('Hall updated!'); }
      else { await api.post('/halls', form); toast.success('Hall added!'); }
      setForm(empty); setEditId(null); setShowForm(false); fetchHalls();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this hall?')) return;
    try { await api.delete(`/halls/${id}`); toast.success('Hall deleted'); fetchHalls(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🏛️ Exam Halls</h1>
          <button onClick={() => { setShowForm(!showForm); setForm(empty); setEditId(null); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
            {showForm ? 'Cancel' : '+ Add Hall'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[['hall_name','Hall Name','text'], ['hall_number','Hall Number','text'], ['capacity','Capacity','number'], ['building','Building','text'], ['floor','Floor','number']].map(([f,l,t]) => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                <input type={t} value={form[f]} required={['hall_name','hall_number','capacity'].includes(f)}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
            ))}
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="avail" checked={form.is_available}
                onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
              <label htmlFor="avail" className="text-sm text-gray-700">Available</label>
            </div>
            <div className="sm:col-span-3">
              <button type="submit" disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                {loading ? 'Saving...' : editId ? 'Update Hall' : 'Add Hall'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {halls.length === 0 ? <p className="text-gray-400 col-span-3 text-center py-8">No halls yet</p> :
            halls.map((h) => (
              <div key={h.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{h.hall_name}</h3>
                    <p className="text-gray-500 text-sm">#{h.hall_number}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${h.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {h.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Capacity: <strong>{h.capacity}</strong></p>
                  {h.building && <p>Building: {h.building}, Floor {h.floor}</p>}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => { setForm({ ...h, capacity: String(h.capacity), floor: String(h.floor) }); setEditId(h.id); setShowForm(true); }}
                    className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(h.id)} className="text-red-500 hover:underline text-sm">Delete</button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function Allocations() {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    api.get('/schedule').then(res => setSchedules(res.data)).catch(() => toast.error('Failed to load schedules'));
  }, []);

  const loadAllocations = async (scheduleId) => {
    if (!scheduleId) return;
    setLoading(true);
    try {
      const res = await api.get(`/allocations/${scheduleId}`);
      setAllocations(res.data);
    } catch { toast.error('Failed to load allocations'); }
    finally { setLoading(false); }
  };

  const handleScheduleChange = (e) => {
    setSelectedSchedule(e.target.value);
    setAllocations([]);
    loadAllocations(e.target.value);
  };

  const handleAutoAllocate = async () => {
    if (!selectedSchedule) return toast.error('Please select an exam schedule first');
    setAllocating(true);
    try {
      const res = await api.post('/allocations/auto-allocate', { schedule_id: selectedSchedule });
      toast.success(res.data.message);
      loadAllocations(selectedSchedule);
    } catch (err) { toast.error(err.response?.data?.message || 'Allocation failed'); }
    finally { setAllocating(false); }
  };

  const handleDownloadPDF = () => {
    if (!selectedSchedule) return toast.error('Select a schedule first');
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/allocations/${selectedSchedule}/pdf`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `seating-arrangement-${selectedSchedule}.pdf`;
        a.click();
      })
      .catch(() => toast.error('Failed to download PDF'));
  };

  // Group by hall
  const hallGroups = allocations.reduce((acc, a) => {
    const key = a.hall_number;
    if (!acc[key]) acc[key] = { hall_name: a.hall_name, hall_number: a.hall_number, building: a.building, floor: a.floor, students: [] };
    acc[key].students.push(a);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🗺️ Hall Allocations</h1>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam Schedule</label>
              <select value={selectedSchedule} onChange={handleScheduleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select schedule...</option>
                {schedules.map(s => (
                  <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code}) – {new Date(s.exam_date).toLocaleDateString()}</option>
                ))}
              </select>
            </div>
            <button onClick={handleAutoAllocate} disabled={allocating || !selectedSchedule}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium disabled:opacity-50 whitespace-nowrap">
              {allocating ? '⏳ Allocating...' : '⚡ Auto-Allocate'}
            </button>
            <button onClick={handleDownloadPDF} disabled={allocations.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium disabled:opacity-50 whitespace-nowrap">
              📄 Download PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-blue-600 text-lg">Loading allocations...</div>
        ) : allocations.length === 0 && selectedSchedule ? (
          <div className="text-center py-12 text-gray-400">No allocations yet. Click "Auto-Allocate" to generate seating arrangement.</div>
        ) : (
          Object.values(hallGroups).map((hall) => (
            <div key={hall.hall_number} className="bg-white rounded-xl shadow mb-6">
              <div className="bg-blue-600 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold">{hall.hall_name} – {hall.hall_number}</h2>
                  {hall.building && <p className="text-blue-100 text-sm">{hall.building}, Floor {hall.floor}</p>}
                </div>
                <span className="bg-white text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
                  {hall.students.length} Students
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50">
                    <tr>
                      {['Seat No.', 'Roll Number', 'Student Name', 'Department', 'Semester'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hall.students.map((s) => (
                      <tr key={s.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-medium text-blue-700">{s.seat_number}</td>
                        <td className="px-4 py-3">{s.roll_number || '-'}</td>
                        <td className="px-4 py-3">{s.student_name}</td>
                        <td className="px-4 py-3">{s.department || '-'}</td>
                        <td className="px-4 py-3">{s.semester || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

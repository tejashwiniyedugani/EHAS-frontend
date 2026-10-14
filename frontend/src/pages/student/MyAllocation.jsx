import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function MyAllocation() {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/allocations/student/my-allocation')
      .then(res => setAllocations(res.data))
      .catch(() => toast.error('Failed to load your allocation'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">My Exam Hall Allocation</h1>
          <p className="text-gray-500">Welcome, <strong>{user?.name}</strong> | Roll No: {user?.roll_number || 'N/A'}</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-blue-600 text-lg">Loading your allocations...</div>
        ) : allocations.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">No hall allocation found yet.</p>
            <p className="text-gray-400 text-sm mt-2">Contact your administrator if you believe this is an error.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allocations.map((a) => (
              <div key={a.id} className="bg-white rounded-xl shadow-md border-l-4 border-blue-500 p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{a.subject_name}</h2>
                    <p className="text-gray-500 text-sm font-mono">{a.subject_code}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{a.seat_number}</div>
                    <div className="text-xs text-gray-500 mt-1">Seat Number</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 text-xs mb-1">📅 Date</div>
                    <div className="font-semibold">{new Date(a.exam_date).toDateString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 text-xs mb-1">⏰ Time</div>
                    <div className="font-semibold">{a.start_time} – {a.end_time}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 text-xs mb-1">🏛️ Hall</div>
                    <div className="font-semibold">{a.hall_name} ({a.hall_number})</div>
                  </div>
                  {a.building && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-gray-500 text-xs mb-1">🏢 Building</div>
                      <div className="font-semibold">{a.building}, Floor {a.floor}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

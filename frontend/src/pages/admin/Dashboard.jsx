import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, halls: 0, subjects: 0, schedules: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, halls, subjects, schedule] = await Promise.all([
          api.get('/students'),
          api.get('/halls'),
          api.get('/subjects'),
          api.get('/schedule'),
        ]);
        setStats({
          students: students.data.length,
          halls: halls.data.length,
          subjects: subjects.data.length,
          schedules: schedule.data.length,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.students, color: 'bg-blue-500', icon: '👨‍🎓' },
    { label: 'Exam Halls', value: stats.halls, color: 'bg-green-500', icon: '🏛️' },
    { label: 'Subjects', value: stats.subjects, color: 'bg-purple-500', icon: '📚' },
    { label: 'Exam Schedules', value: stats.schedules, color: 'bg-orange-500', icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Examination Hall Allocation System Overview</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {cards.map((card) => (
            <div key={card.label} className={`${card.color} text-white rounded-xl p-6 shadow`}>
              <div className="text-4xl mb-2">{card.icon}</div>
              <div className="text-4xl font-bold">{card.value}</div>
              <div className="text-sm opacity-90 mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Guide</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Add <strong>Halls</strong> – Enter hall names, numbers, and capacities.</li>
            <li>Add <strong>Subjects</strong> – Enter subject codes, names, department, and semester.</li>
            <li>Add <strong>Students</strong> – Register students with their department and semester.</li>
            <li>Create <strong>Exam Schedule</strong> – Assign dates and times to subjects.</li>
            <li>Add <strong>Invigilators</strong> and assign them to halls.</li>
            <li>Go to <strong>Allocations</strong> – Auto-allocate students and download PDF.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

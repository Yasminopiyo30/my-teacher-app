'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// SIMULATED DUMMY API — reads from/saves to localStorage
function getLearners() {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('learners');
  return saved ? JSON.parse(saved) : [];
}

function saveLearners(learners: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('learners', JSON.stringify(learners));
  }
}

export default function Dashboard() {
  const router = useRouter();
  const [learners, setLearners] = useState<any[]>([]);

  // Load learners + check auth
  useEffect(() => {
    // Redirect if not logged in
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (isLoggedIn !== 'true') {
        router.push('/');
      }
    }

    // Load learners from "dummy API"
    let currentLearners = getLearners();
    if (currentLearners.length === 0) {
      const dummy = [
        {
          id: 1,
          name: 'Alice Johnson',
          class: 'Class 1',
          subjects: [
            { name: 'Math', pathway: 'STEM', marks: [{ value: 85, exam: 'Exam 1' }] },
            { name: 'History', pathway: 'Humanities', marks: [{ value: 70, exam: 'Exam 1' }] },
          ],
        },
        {
          id: 2,
          name: 'Bob Smith',
          class: 'Class 2',
          subjects: [
            { name: 'Art', pathway: 'Creative Arts', marks: [{ value: 90, exam: 'Exam 1' }] },
          ],
        },
      ];
      saveLearners(dummy);
      setLearners(dummy);
    } else {
      setLearners(currentLearners);
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Learner Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Logout
        </button>
      </header>

      <div className="mb-8">
        <button
          onClick={() => router.push('/add-learner')}
          className="rounded-md bg-green-600 px-6 py-3 text-white font-medium transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          ➕ Add New Learner
        </button>
      </div>

      {learners.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <p className="text-gray-500">No learners registered yet.</p>
          <p className="mt-2 text-sm text-gray-400">
            Click &quot;Add New Learner&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {learners.map((learner) => (
            <div
              key={learner.id}
              className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {learner.name}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Class: {learner.class || 'N/A'} | Subjects: {learner.subjects.length}
              </p>
              <div className="mt-4 space-y-2">
                {learner.subjects.map((subject: any, idx: number) => (
                  <div key={idx} className="text-xs text-gray-500">
                    {subject.name} → {subject.pathway}
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push(`/learner/${learner.id}`)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
              >
                View Report
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
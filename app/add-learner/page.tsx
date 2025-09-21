'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// "dummy API data"
const SUBJECTS = [
  { name: 'Math', pathway: 'STEM' },
  { name: 'Biology', pathway: 'STEM' },
  { name: 'History', pathway: 'Humanities' },
  { name: 'Art', pathway: 'Creative Arts' },
  { name: 'Music', pathway: 'Creative Arts' },
];

export default function AddLearnerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (isLoggedIn !== 'true') {
        router.push('/');
      }
    }
  }, [router]);

  const handleSubjectToggle = (subjectName: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectName)
        ? prev.filter((name) => name !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter learner name');
      return;
    }

    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    // saving to localStorage
    let learners: any[] = [];
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('learners');
      if (saved) learners = JSON.parse(saved);
    }

    const newLearner = {
      id: Date.now(), // unique ID
      name: name.trim(),
      subjects: selectedSubjects.map((subjectName) => {
        const subject = SUBJECTS.find((s) => s.name === subjectName);
        return {
          name: subjectName,
          pathway: subject?.pathway || 'Unknown',
          marks: [], // add marks later
        };
      }),
    };

    learners.push(newLearner);

    if (typeof window !== 'undefined') {
      localStorage.setItem('learners', JSON.stringify(learners));
    }

    alert(` ${name} has been registered!`);
    router.push('/dashboard'); // go back to dashboard
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:underline flex items-center"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Register New Learner</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Learner Name Input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Learner Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Alice Johnson"
              required
            />
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Subjects (each tied to a Pathway)
            </label>
            <div className="space-y-3">
              {SUBJECTS.map((subject) => (
                <label
                  key={subject.name}
                  className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject.name)}
                    onChange={() => handleSubjectToggle(subject.name)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3">
                    <strong>{subject.name}</strong> →{' '}
                    <span className="text-gray-500">{subject.pathway}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              Register Learner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

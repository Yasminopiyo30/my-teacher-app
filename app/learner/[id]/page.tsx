'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// SIMULATED DUMMY API — get and update learners
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

function addMark(learnerId: number, subjectName: string, mark: number, exam: string) {
  const learners = getLearners();
  const updated = learners.map((learner: any) => {
    if (learner.id === learnerId) {
      return {
        ...learner,
        subjects: learner.subjects.map((subj: any) =>
          subj.name === subjectName
            ? { ...subj, marks: [...(subj.marks || []), { value: mark, exam }] }
            : subj
        ),
      };
    }
    return learner;
  });
  saveLearners(updated);
}

// PATHWAY CALCULATION LOGIC
function calculatePathway(learner: any) {
  if (!learner.subjects || learner.subjects.length === 0) {
    return { pathway: 'No Subjects', avg: 0, allPathways: [] };
  }

  // Calculate average mark per subject
  const subjectAverages = learner.subjects
    .filter((s: any) => s.marks && s.marks.length > 0)
    .map((s: any) => ({
      ...s,
      avg: s.marks.reduce((sum: number, m: any) => sum + m.value, 0) / s.marks.length,
    }));

  if (subjectAverages.length === 0) {
    return { pathway: 'No Marks Yet', avg: 0, allPathways: [] };
  }

  // Group by pathway
  const pathwayMap: { [key: string]: number[] } = {};
  subjectAverages.forEach((s: any) => {
    if (!pathwayMap[s.pathway]) pathwayMap[s.pathway] = [];
    pathwayMap[s.pathway].push(s.avg);
  });

  // Calculate average per pathway
  const pathwayAvgs = Object.keys(pathwayMap).map((path) => {
    const avg = pathwayMap[path].reduce((sum, a) => sum + a, 0) / pathwayMap[path].length;
    return { pathway: path, avg };
  });

  // Find pathway with highest average
  const best = pathwayAvgs.reduce((best, curr) => (curr.avg > best.avg ? curr : best));
  return { ...best, allPathways: pathwayAvgs };
}

export default function LearnerReportPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const EXAMS = ['Exam 1', 'Exam 2'];

  const [learner, setLearner] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>(EXAMS[0]);
  const [mark, setMark] = useState<string>('');

  // Load learner data
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      router.push('/');
      return;
    }

    const learners = getLearners();
    const found = learners.find((l: any) => l.id == id);
    if (!found) {
      alert('Learner not found');
      router.push('/dashboard');
      return;
    }
    setLearner(found);
  }, [id, router]);

  // Debug exam selection
  useEffect(() => {
    console.log('Selected Exam:', selectedExam);
  }, [selectedExam]);

  const handleAddMark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !mark || isNaN(Number(mark)) || !selectedExam) {
      alert('Please select a subject, exam, and enter a valid mark');
      return;
    }

    const markNum = parseFloat(mark);
    if (markNum < 0 || markNum > 100) {
      alert('Mark must be between 0 and 100');
      return;
    }

    addMark(Number(id), selectedSubject, markNum, selectedExam);

    // Refresh learner data
    const learners = getLearners();
    const updatedLearner = learners.find((l: any) => l.id == id);
    setLearner(updatedLearner);

    // Reset form
    setMark('');
    setSelectedSubject('');
  };

  if (!learner) {
    return <div className="p-8 text-gray-600">Loading...</div>;
  }

  const pathway = calculatePathway(learner);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-100 min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:underline flex items-center"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{learner.name}</h1>
        <p className="text-gray-600 mb-6">Class: {learner.class || 'N/A'}</p>

        {/* PATHWAY REPORT BANNER */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg mb-8">
          <h2 className="font-bold text-lg text-green-800">Recommended Pathway</h2>
          <p className="text-2xl font-bold text-green-700">
            {pathway.pathway}
            <span className="text-sm font-normal ml-2">
              ({pathway.avg.toFixed(1)}% Average)
            </span>
          </p>
          {pathway.allPathways.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700">All Pathways:</p>
              {pathway.allPathways.map((p: any) => (
                <p key={p.pathway} className="text-sm text-gray-600">
                  {p.pathway}: {p.avg.toFixed(1)}%
                </p>
              ))}
            </div>
          )}
        </div>

        {/* SUBJECTS & MARKS */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Subjects & Marks</h2>
          <div className="space-y-4">
            {learner.subjects.map((subject: any, idx: number) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{subject.name}</h3>
                    <p className="text-sm text-gray-600">{subject.pathway}</p>
                  </div>
                  <div className="text-right">
                    {subject.marks.length === 0 ? (
                      <p className="text-gray-500 italic">No marks yet</p>
                    ) : (
                      <>
                        {subject.marks.map((m: any, i: number) => (
                          <p key={i} className="font-mono text-sm">
                            {m.exam}: {m.value}
                          </p>
                        ))}
                        <p className="text-sm text-gray-600 mt-1">
                          Avg:{' '}
                          {(subject.marks.reduce((a: number, m: any) => a + m.value, 0) /
                            subject.marks.length).toFixed(1)}%
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADD MARK FORM */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">➕ Add New Mark</h2>
          <form
            onSubmit={handleAddMark}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-[48px] appearance-none"
                required
              >
                <option value="">Select Subject</option>
                {learner.subjects.map((subject: any, idx: number) => (
                  <option key={idx} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-[48px] appearance-none"
                required
              >
                {EXAMS.map((exam) => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mark (0-100)
              </label>
              <input
                type="number"
                value={mark}
                onChange={(e) => setMark(e.target.value)}
                min="0"
                max="100"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 min-h-[48px]"
                placeholder="e.g. 85"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors whitespace-nowrap"
            >
              Add Mark
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
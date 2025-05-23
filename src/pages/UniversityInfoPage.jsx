import React, { useState } from 'react';

export default function UniversityInfoPage() {
  const departments = ["IT", "Botonay", "Physics", "Chemistry", "Urdu", "Math", "English"];
  const [selectedDept, setSelectedDept] = useState(null);
  const [query, setQuery] = useState("");

  return (
    <div className="max-w-3xl mx-auto bg-white bg-opacity-90 p-10 rounded-3xl shadow-xl border border-gray-100 backdrop-blur-sm animate-fade-in">
      <h1 className="text-3xl font-bold text-purple-600 mb-6">University Information</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-4 py-2 rounded-lg font-medium shadow-md transition ${selectedDept === dept
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {selectedDept && (
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">
            Ask your question about <span className="font-bold text-purple-600">{selectedDept}</span> department:
          </p>
          <textarea
            rows="4"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-400"
            placeholder="Type your department-related question here..."
          ></textarea>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

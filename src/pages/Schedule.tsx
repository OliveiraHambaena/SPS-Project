import React from 'react';
import Dashboard from './Dashboard';

export default function Schedule() {
  return (
    <Dashboard>
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">

        <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center max-w-lg w-full">
          <svg className="w-24 h-24 mb-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 48 48">
            <rect x="6" y="10" width="36" height="32" rx="4" className="fill-emerald-50 stroke-emerald-400" />
            <rect x="6" y="18" width="36" height="24" rx="2" className="fill-white stroke-emerald-300" />
            <line x1="6" y1="18" x2="42" y2="18" className="stroke-emerald-200" />
            <circle cx="16" cy="26" r="2" className="fill-emerald-300" />
            <circle cx="24" cy="34" r="2" className="fill-emerald-300" />
            <circle cx="32" cy="26" r="2" className="fill-emerald-300" />
          </svg>
          <p className="text-gray-600 text-lg mb-4 text-center">
            You have no scheduled events.<br />
            Stay organized by adding your first event!
          </p>
          <button
            className="mt-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow transition-colors duration-200"
            disabled
          >
            + Add Event (Coming Soon)
          </button>
        </div>
      </div>
    </Dashboard>
  );
}

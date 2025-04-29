import React from 'react';
import Dashboard from './Dashboard';

export default function Certificates() {
  return (
    <Dashboard>
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-6 text-emerald-700">My Certificates</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">You have not received any certificates yet.</p>
        </div>
      </div>
    </Dashboard>
  );
}

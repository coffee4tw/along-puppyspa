'use client';

import { useEffect, useState } from 'react';
import { WaitingListEntry, Owner, Puppy, Service } from '@along-puppyspa/shared';
import AddEntryForm from './add-entry-form';

interface WaitingListEntryWithDetails extends WaitingListEntry {
  owner: Owner;
  puppy: Puppy;
  service: Service;
}

export default function WaitingListPage() {
  const [entries, setEntries] = useState<WaitingListEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchWaitingList = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/waiting-list', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch waiting list');
      }
      const data = await response.json();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitingList();
  }, []);

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchWaitingList();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Waiting List</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Add New Entry
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Add New Entry</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AddEntryForm onSuccess={handleAddSuccess} />
            </div>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center text-gray-500">No entries in the waiting list</div>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{entry.puppy.name}</h2>
                  <p className="text-gray-600">{entry.puppy.breed}</p>
                  <p className="text-sm text-gray-500">Owner: {entry.owner.name}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    entry.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    entry.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {entry.status}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Service: {entry.service.name}
                </p>
                <div className="text-sm text-gray-500">
                  Arrival Time: {new Date(entry.arrival_time).toLocaleString()}
                </div>
                {entry.notes && (
                  <p className="mt-2 text-sm text-gray-600">{entry.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WaitingListEntry, Owner, Puppy, Service, DailyWaitingList } from '@along-puppyspa/shared';
import AddEntryForm from '../add-entry-form';

interface WaitingListEntryWithDetails extends WaitingListEntry {
  owner: Owner;
  puppy: Puppy;
  service: Service;
}

export default function WaitingListPage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string;
  
  const [dailyList, setDailyList] = useState<DailyWaitingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  const fetchDailyList = async (targetDate: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/daily-waiting-list/${targetDate}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Create the list if it doesn't exist
          const createResponse = await fetch('http://localhost:3000/api/daily-waiting-list', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: targetDate }),
          });
          
          if (!createResponse.ok) {
            throw new Error('Failed to create waiting list');
          }
          
          const newList = await createResponse.json();
          setDailyList(newList);
        } else {
          throw new Error('Failed to fetch waiting list');
        }
      } else {
        const data = await response.json();
        setDailyList(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchDailyList(date);
  }, [date]);

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchDailyList(date);
  };

  const moveEntry = async (entryId: string, direction: 'up' | 'down') => {
    if (!dailyList) return;

    const entry = dailyList.entries.find(e => e.id === entryId);
    if (!entry) return;

    const currentIndex = dailyList.entries.findIndex(e => e.id === entryId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= dailyList.entries.length) return;

    try {
      // Swap positions
      const updatedEntries = [...dailyList.entries];
      const tempPosition = updatedEntries[currentIndex].position;
      updatedEntries[currentIndex].position = updatedEntries[newIndex].position;
      updatedEntries[newIndex].position = tempPosition;

      // Update the entries in the database
      await fetch(`http://localhost:3000/api/waiting-list/${entryId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position: updatedEntries[currentIndex].position }),
      });

      await fetch(`http://localhost:3000/api/waiting-list/${updatedEntries[newIndex].id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position: updatedEntries[newIndex].position }),
      });

      // Update local state
      setDailyList({
        ...dailyList,
        entries: updatedEntries.sort((a, b) => a.position - b.position),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder entries');
    }
  };

  const toggleEntryStatus = async (entryId: string, currentStatus: string) => {
    if (!dailyList) return;

    try {
      const newStatus = currentStatus === 'completed' ? 'waiting' : 'completed';
      
      const response = await fetch(`http://localhost:3000/api/waiting-list/${entryId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update entry status');
      }

      // Update local state
      setDailyList({
        ...dailyList,
        entries: dailyList.entries.map(entry => 
          entry.id === entryId 
            ? { ...entry, status: newStatus }
            : entry
        ),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry status');
    }
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

  const filteredEntries = dailyList?.entries.filter(entry => 
    showCompleted || entry.status !== 'completed'
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Waiting List</h1>
          <p className="text-gray-500 mt-2">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="space-x-4">
          <button
            onClick={() => setReordering(!reordering)}
            className={`px-4 py-2 rounded font-medium ${
              reordering 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {reordering ? 'Done Reordering' : 'Reorder List'}
          </button>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-4 py-2 rounded font-medium ${
              showCompleted 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Add New Entry
          </button>
        </div>
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
              <AddEntryForm onSuccess={handleAddSuccess} dailyListId={dailyList?.id} />
            </div>
          </div>
        </div>
      )}

      {filteredEntries.length === 0 ? (
        <div className="text-center text-gray-500">No entries in the waiting list for this date</div>
      ) : (
        <div className="grid gap-4">
          {filteredEntries.map((entry, index) => (
            <div
              key={entry.id}
              className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow ${
                entry.status === 'completed' ? 'opacity-75' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={entry.status === 'completed'}
                    onChange={() => toggleEntryStatus(entry.id, entry.status)}
                    className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{entry.puppy?.name}</h3>
                    <p className="text-gray-500">{entry.puppy?.breed}</p>
                    <p className="text-sm text-gray-500">
                      Owner: {entry.owner?.name} ({entry.owner?.phone})
                    </p>
                    <p className="text-sm text-gray-500">
                      Service: {entry.service?.name}
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-gray-500 mt-2">Notes: {entry.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {reordering && (
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => moveEntry(entry.id, 'up')}
                        disabled={index === 0}
                        className={`p-2 rounded ${
                          index === 0 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveEntry(entry.id, 'down')}
                        disabled={index === filteredEntries.length - 1}
                        className={`p-2 rounded ${
                          index === filteredEntries.length - 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        ↓
                      </button>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      entry.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                      entry.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {entry.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Position: {entry.position}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
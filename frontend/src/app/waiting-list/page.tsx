'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WaitingListEntry, Owner, Puppy, Service, DailyWaitingList } from '@along-puppyspa/shared';
import AddEntryForm from './add-entry-form';

interface WaitingListEntryWithDetails extends WaitingListEntry {
  owner: Owner;
  puppy: Puppy;
  service: Service;
}

export default function WaitingListPage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string || new Date().toISOString().split('T')[0];
  
  const [dailyList, setDailyList] = useState<DailyWaitingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date);

  const fetchDailyList = async (targetDate: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/daily-waiting-list/${targetDate}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Create the list if it doesn't exist
          const createResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/daily-waiting-list`, {
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

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    router.push(`/waiting-list/${today}`);
  }, [router]);

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchDailyList(date);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    router.push(`/waiting-list/${newDate}`);
  };

  const navigateToDate = (days: number) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + days);
    const newDate = currentDate.toISOString().split('T')[0];
    router.push(`/waiting-list/${newDate}`);
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
        <div>
          <h1 className="text-3xl font-bold">Waiting List</h1>
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => navigateToDate(-1)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Previous Day
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="border rounded px-3 py-1"
            />
            <button
              onClick={() => navigateToDate(1)}
              className="text-gray-500 hover:text-gray-700"
            >
              Next Day →
            </button>
          </div>
          <p className="text-gray-500 mt-2">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
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
              <AddEntryForm onSuccess={handleAddSuccess} dailyListId={dailyList?.id} />
            </div>
          </div>
        </div>
      )}

      {!dailyList?.entries || dailyList.entries.length === 0 ? (
        <div className="text-center text-gray-500">No entries in the waiting list for this date</div>
      ) : (
        <div className="grid gap-4">
          {dailyList.entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
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
          ))}
        </div>
      )}
    </div>
  );
} 
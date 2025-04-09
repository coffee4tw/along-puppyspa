'use client';

import { useState, useEffect } from 'react';
import { DailyWaitingList } from '@along-puppyspa/shared';
import Link from 'next/link';

export default function DailyWaitingLists() {
  const [lists, setLists] = useState<DailyWaitingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/daily-waiting-list', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch daily waiting lists');
        }
        const data = await response.json();
        setLists(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayList = lists.find(list => list.date === today);

  const handleCreateTodayList = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/daily-waiting-list', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: today }),
      });
      if (!response.ok) {
        throw new Error('Failed to create today\'s waiting list');
      }
      const data = await response.json();
      setLists([data, ...lists]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Today's Waiting List</h2>
        {todayList ? (
          <Link
            href={`/waiting-list/${today}`}
            className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Today's List</h3>
                <p className="text-sm text-gray-500">
                  {todayList.entries.length} entries
                </p>
              </div>
              <span className="text-blue-500">View →</span>
            </div>
          </Link>
        ) : (
          <button
            onClick={handleCreateTodayList}
            className="w-full p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Create Today's List</h3>
                <p className="text-sm text-gray-500">Start a new waiting list for today</p>
              </div>
              <span className="text-green-500">Create →</span>
            </div>
          </button>
        )}
      </div>

      {/* Historical Lists */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Historical Lists</h2>
        <div className="space-y-4">
          {lists
            .filter(list => list.date !== today)
            .map(list => (
              <Link
                key={list.id}
                href={`/waiting-list/${list.date}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {new Date(list.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {list.entries.length} entries
                    </p>
                  </div>
                  <span className="text-gray-500">View →</span>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
} 
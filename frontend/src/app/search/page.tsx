'use client';

import { useState, useEffect } from 'react';
import { WaitingListEntry, Owner, Puppy, Service } from '@along-puppyspa/shared';
import Link from 'next/link';

interface WaitingListEntryWithDetails extends WaitingListEntry {
  owner: Owner;
  puppy: Puppy;
  service: Service;
  daily_list: {
    date: string;
  };
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<WaitingListEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchEntries = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/waiting-list/search?q=${encodeURIComponent(term)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search waiting list entries');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      searchEntries(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const groupByPuppy = (entries: WaitingListEntryWithDetails[]) => {
    const groups: { [key: string]: WaitingListEntryWithDetails[] } = {};

    entries.forEach(entry => {
      const key = `${entry.puppy.id}-${entry.puppy.name}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entry);
    });

    return groups;
  };

  const puppyGroups = groupByPuppy(results);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Search Service History</h1>
        
        <div className="mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by puppy name, breed, or owner details..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-center">{error}</div>
        )}

        {!loading && !error && searchTerm && results.length === 0 && (
          <div className="text-center text-gray-500">No results found</div>
        )}

        {!loading && !error && Object.keys(puppyGroups).length > 0 && (
          <div className="space-y-8">
            {Object.entries(puppyGroups).map(([key, entries]) => {
              const puppy = entries[0].puppy;
              const owner = entries[0].owner;
              
              return (
                <div key={key} className="bg-white rounded-lg shadow p-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold">{puppy.name}</h2>
                    <p className="text-gray-500">{puppy.breed}</p>
                    <p className="text-sm text-gray-500">
                      Owner: {owner.name} ({owner.phone})
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Service History</h3>
                    {entries
                      .sort((a, b) => new Date(b.daily_list.date).getTime() - new Date(a.daily_list.date).getTime())
                      .map(entry => (
                        <div key={entry.id} className="border-t pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {new Date(entry.daily_list.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                              <p className="text-gray-500">{entry.service.name}</p>
                              {entry.notes && (
                                <p className="text-sm text-gray-500 mt-1">Notes: {entry.notes}</p>
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
                              <Link
                                href={`/waiting-list/${entry.daily_list.date}`}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                View List →
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 
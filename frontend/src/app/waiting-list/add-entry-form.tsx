'use client';

import { useState, useEffect } from 'react';
import { Owner, Puppy, Service } from '@along-puppyspa/shared';

interface AddEntryFormProps {
  onSuccess: () => void;
  dailyListId?: string;
}

export default function AddEntryForm({ onSuccess, dailyListId }: AddEntryFormProps) {
  const [owner, setOwner] = useState<Omit<Owner, 'id'>>({
    name: '',
    email: '',
    phone: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const [puppy, setPuppy] = useState<Omit<Puppy, 'id' | 'owner_id'>>({
    name: '',
    breed: '',
    age: 0,
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/services', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data);
        if (data.length > 0) {
          setServiceId(data[0].id); // Set default service
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load services');
      }
    };

    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/waiting-list', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          puppy,
          serviceId,
          notes,
          dailyListId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create waiting list entry');
      }

      // Reset form
      setOwner({ 
        name: '', 
        email: '', 
        phone: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setPuppy({ 
        name: '', 
        breed: '', 
        age: 0, 
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setServiceId(services[0]?.id || '');
      setNotes('');
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Owner Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={owner.name}
              onChange={(e) => setOwner({ ...owner, name: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={owner.email}
              onChange={(e) => setOwner({ ...owner, email: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={owner.phone}
              onChange={(e) => setOwner({ ...owner, phone: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Puppy Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={puppy.name}
              onChange={(e) => setPuppy({ ...puppy, name: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Breed</label>
            <input
              type="text"
              value={puppy.breed}
              onChange={(e) => setPuppy({ ...puppy, breed: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              value={puppy.age}
              onChange={(e) => setPuppy({ ...puppy, age: parseInt(e.target.value) })}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={puppy.notes}
              onChange={(e) => setPuppy({ ...puppy, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Service Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">Service</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Entry'}
        </button>
      </div>
    </form>
  );
} 
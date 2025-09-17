'use client';

import { useState, useEffect } from 'react';
import { searchEnhancedListingsClient } from '@/lib/data-integration-client';

export default function TestSellerSearch() {
  const [sellerId, setSellerId] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!sellerId.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Searching with sellerId:', sellerId);
      const searchResults = await searchEnhancedListingsClient({
        seller: sellerId,
        offset: 0,
        limit: 10
      });
      
      console.log('Search results:', searchResults);
      setResults(searchResults.results);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Seller Search</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={sellerId}
          onChange={(e) => setSellerId(e.target.value)}
          placeholder="Enter seller ID"
          className="border p-2 mr-2"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !sellerId.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Results ({results.length}):</h2>
        {results.length > 0 ? (
          <ul className="space-y-2">
            {results.map((listing) => (
              <li key={listing._id} className="border p-2 rounded">
                <strong>{listing.title}</strong>
                <br />
                ID: {listing._id}
                <br />
                Seller ID: {listing.supabaseId}
              </li>
            ))}
          </ul>
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
}
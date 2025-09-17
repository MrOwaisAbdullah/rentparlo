'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DebugURLParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const newParams: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      newParams[key] = value;
    }
    setParams(newParams);
    console.log('Current URL parameters:', newParams);
  }, [searchParams]);

  const updateURL = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('test', 'value');
    const newUrl = `${pathname}?${newParams.toString()}`;
    console.log('Updating URL to:', newUrl);
    router.push(newUrl);
  };

  const removeTestParam = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('test');
    const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;
    console.log('Updating URL to:', newUrl);
    router.push(newUrl);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Debug URL Parameters</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Current URL Parameters:</h2>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify(params, null, 2)}
        </pre>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Seller Parameter:</h2>
        <p className="text-lg">
          Seller ID: <strong>{params.seller || 'Not found'}</strong>
        </p>
      </div>
      <div className="space-x-2">
        <button 
          onClick={updateURL}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Test Parameter
        </button>
        <button 
          onClick={removeTestParam}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Remove Test Parameter
        </button>
      </div>
    </div>
  );
}
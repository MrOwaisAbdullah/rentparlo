'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DebugSellerParams() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const newParams: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      newParams[key] = value;
    }
    setParams(newParams);
    console.log('Current URL parameters:', newParams);
  }, [searchParams]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Seller Parameters</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">URL Parameters:</h2>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify(params, null, 2)}
        </pre>
      </div>
      <div>
        <h2 className="text-xl font-semibold">Seller Parameter:</h2>
        <p className="text-lg">
          Seller ID: <strong>{params.seller || 'Not found'}</strong>
        </p>
      </div>
    </div>
  );
}
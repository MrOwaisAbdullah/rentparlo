// Hook for safe client-side operations
'use client';

import { useEffect, useState } from 'react';

// Hook to detect if we're on the client side
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

// Hook for safe DOM operations
export function useSafeDOM() {
  const isClient = useIsClient();
  
  const safeQuerySelector = (selector: string) => {
    if (!isClient) return null;
    try {
      return document.querySelector(selector);
    } catch (error) {
      console.warn('Error querying selector:', error);
      return null;
    }
  };

  const safeGetElementById = (id: string) => {
    if (!isClient) return null;
    try {
      return document.getElementById(id);
    } catch (error) {
      console.warn('Error getting element by ID:', error);
      return null;
    }
  };

  return {
    isClient,
    safeQuerySelector,
    safeGetElementById
  };
}
'use client';

import { Button } from '@/components/ui/button';

export function ClientRetryButton() {
  return (
    <Button 
      onClick={() => window.location.reload()} 
      className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
    >
      Retry
    </Button>
  );
}
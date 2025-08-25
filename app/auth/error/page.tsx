import { Metadata } from 'next';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'Authentication Error | RentParLo.pk',
  description: 'An error occurred during authentication',
};

interface AuthErrorPageProps {
  searchParams: {
    message?: string;
  };
}

export default function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const errorMessage = searchParams.message || 'An unknown error occurred during authentication';

  const getErrorDetails = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('access_denied')) {
      return {
        title: 'Access Denied',
        description: 'You cancelled the authentication process or denied access to your account.',
        suggestion: 'Please try signing in again and make sure to allow access to continue.'
      };
    }
    
    if (lowerMessage.includes('invalid_request')) {
      return {
        title: 'Invalid Request',
        description: 'The authentication request was invalid or malformed.',
        suggestion: 'Please try signing in again from the beginning.'
      };
    }
    
    if (lowerMessage.includes('server_error') || lowerMessage.includes('temporarily_unavailable')) {
      return {
        title: 'Server Error',
        description: 'Our authentication service is temporarily unavailable.',
        suggestion: 'Please try again in a few moments. If the problem persists, contact support.'
      };
    }
    
    if (lowerMessage.includes('unauthorized_client')) {
      return {
        title: 'Unauthorized Client',
        description: 'The authentication service is not properly configured.',
        suggestion: 'Please contact support for assistance.'
      };
    }
    
    // Default error
    return {
      title: 'Authentication Failed',
      description: 'We couldn\'t complete your sign-in process.',
      suggestion: 'Please try signing in again. If the problem continues, contact our support team.'
    };
  };

  const errorDetails = getErrorDetails(errorMessage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-900">
              {errorDetails.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {errorDetails.description}
              </p>
              <p className="text-sm font-medium text-foreground">
                {errorDetails.suggestion}
              </p>
            </div>

            {/* Error details for debugging */}
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-xs text-red-700 font-mono break-all">
                {errorMessage}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Link>
              </Button>
            </div>

            {/* Help text */}
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Still having trouble?{' '}
                <Link 
                  href="/contact" 
                  className="text-primary hover:underline font-medium"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
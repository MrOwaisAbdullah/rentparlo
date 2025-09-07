import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold">Access Denied</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        You do not have permission to view this page.
      </p>
      <Link href="/" className="mt-8 px-4 py-2 text-white bg-primary rounded-md">
        Go to Homepage
      </Link>
    </div>
  );
}

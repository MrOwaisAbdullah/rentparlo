import { Logo } from '@/components/logo';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
        <Logo />
      </div>
      <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
    </div>
  );
};

export default Loading;

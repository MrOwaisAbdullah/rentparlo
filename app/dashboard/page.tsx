export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      <p className="mt-4 text-muted-foreground">
        Welcome to your seller dashboard. Here you can manage your listings, view analytics, and more.
      </p>
      {/* Placeholder for stats cards */}
      <div className="grid grid-cols-1 gap-8 mt-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-semibold">Total Listings</h3>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-semibold">Total Views</h3>
          <p className="text-3xl font-bold">1.2k</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-semibold">Current Tier</h3>
          <p className="text-3xl font-bold">Gold</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-semibold">Subscription</h3>
          <p className="text-3xl font-bold">Pro</p>
        </div>
      </div>
    </div>
  );
}
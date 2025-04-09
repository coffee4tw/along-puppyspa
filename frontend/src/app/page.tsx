import DailyWaitingLists from './components/daily-waiting-lists';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block text-primary-600">Puppy Spa</span>
            <span className="block">Waiting List</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Welcome to the Puppy Spa waiting list management system. Here you can manage appointments and track the status of your furry clients.
          </p>
        </div>

        <DailyWaitingLists />
      </div>
    </main>
  );
}

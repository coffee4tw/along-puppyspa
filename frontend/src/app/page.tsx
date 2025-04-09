import DailyWaitingLists from './components/daily-waiting-lists';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1>
          <span className="block text-primary-600">Puppy Spa</span>
          <span className="block">Waiting List</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Welcome to the Puppy Spa waiting list management system. Here you can manage appointments and track the status of your furry clients.
        </p>
        <div className="mt-6">
          <Link href="/search" className="btn-primary">
            Search Service History
          </Link>
        </div>
      </div>

      <DailyWaitingLists />
    </div>
  );
}

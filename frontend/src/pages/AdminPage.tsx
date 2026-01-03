import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminUsers from '../components/AdminUsers';

export default function AdminPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all"
            >
              Home
            </Link>
            <button
              onClick={logout}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 hover:-translate-y-0.5 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Admin Panel</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Manage users and system settings from here.</p>
            <AdminUsers />
          </div>
        </div>
      </main>
    </div>
  );
}

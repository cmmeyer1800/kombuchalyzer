import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Match the API base URL pattern from api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost' : '');

export default function HomePage() {
  const { logout, isAdmin } = useAuth();
  // Construct docs URL - use relative in production, absolute in dev
  const docsUrl = API_BASE_URL ? `${API_BASE_URL}/api/docs` : '/api/docs';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Kombuchalyzer
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/settings"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all"
            >
              Account Settings
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all"
              >
                Admin
              </Link>
            )}
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all"
            >
              API Docs
            </a>
            <button
              onClick={logout}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 hover:-translate-y-0.5 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Your Brew Lab
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Track, analyze, and perfect your kombucha brewing journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Track Your Brews
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Monitor fermentation progress, temperature, and pH levels for each batch
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-5xl mb-4">🧪</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Analyze Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Get insights into your brewing patterns and optimize your recipes
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Recipe Library
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Save and organize your favorite kombucha recipes and variations
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="text-5xl mb-4">🔬</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Experiment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Try new flavors, ingredients, and techniques with confidence
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-md">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Ready to start brewing?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Create your first batch and begin tracking your kombucha journey
          </p>
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all">
            Create New Brew
          </button>
        </div>
      </main>
    </div>
  );
}


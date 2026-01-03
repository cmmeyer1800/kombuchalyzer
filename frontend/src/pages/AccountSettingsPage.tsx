import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, enableTOTP, type User, disableTOTP } from '../utils/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TOTPSetupModal from '../components/TOTPSetupModal';
import TOTPTurnOffModal from '../components/TOTPTurnOffModal';
import { useTheme } from '../contexts/ThemeContext';

export default function AccountSettingsPage() {
  const [isTOTPModalOpen, setIsTOTPModalOpen] = useState(false);
  const [isTOTPTurnOffModalOpen, setIsTOTPTurnOffModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();

  const { data: user, isLoading, error } = useQuery<User | null, Error>({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const [errorMessage, setError] = useState('');
  // setter reserved for future QR fetch; keep to allow wiring later
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // derive enabled state from user object once loaded
  const isTOTPEnabled = !!user?.totp_enabled;

  // prepare enable TOTP mutation
  const enableMutation = useMutation({
    mutationFn: (c: string) => enableTOTP(c),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsTOTPModalOpen(false);
    },
    onError: (err: any) => setError(err instanceof Error ? err.message : String(err)),
  });

  const disableMutation = useMutation({
    mutationFn: (c: string) => disableTOTP(c),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (err: any) => setError(err instanceof Error ? err.message : String(err)),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300 text-lg">Loading...</div>
      </div>
    );
  }

  if ((error instanceof Error && error.message) || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 max-w-md w-full">
          <div className="text-red-600 dark:text-red-400 mb-4">{(error?.message ?? errorMessage) || 'User not found'}</div>
          <Link
            to="/"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Kombuchalyzer
          </h1>
          <Link
            to="/"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Manage your account information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Account Information Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Account Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User ID
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 text-sm font-mono">
                  {user.id}
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Security</h3>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage your security settings and preferences.
              </p>
              <h4 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>Password</h4>
              <button
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all"
                disabled
              >
                Change Password
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Password change functionality coming soon
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-1'>2FA</h4>
                  <div className="mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Status:</span>
                    {isTOTPEnabled ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {isTOTPEnabled ? (
                    <button
                      className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-all cursor-pointer"
                      // disable action for now — backend disable not implemented
                      onClick={() => {
                        setIsTOTPTurnOffModalOpen(true);
                      }}
                    >
                      Manage TOTP
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsTOTPModalOpen(true)}
                      className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all"
                    >
                      Enable TOTP with Authenticator App
                    </button>
                  )}
                </div>
              </div>

              <TOTPSetupModal
                isOpen={isTOTPModalOpen}
                onClose={() => setIsTOTPModalOpen(false)}
                onEnable={async (code: string) => {
                  await enableMutation.mutateAsync(code);
                }}
              />
              <TOTPTurnOffModal
                isOpen={isTOTPTurnOffModalOpen}
                onClose={() => setIsTOTPTurnOffModalOpen(false)}
                onEnable={async (code: string) => {
                  await disableMutation.mutateAsync(code);
                }}
              />
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Theme</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose between light and dark mode
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 dark:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  role="switch"
                  aria-checked={theme === 'dark'}
                  aria-label="Toggle theme"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="pt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Current theme: <span className="font-medium text-gray-900 dark:text-white capitalize">{theme}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


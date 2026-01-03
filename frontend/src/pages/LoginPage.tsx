import { useState, useEffect, useMemo } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { token2fa } from '../utils/api';
import { useMutation } from '@tanstack/react-query';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading, refreshAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(username, password);

      // If backend requested TOTP verification, show the code input
      if (res && typeof res === 'object' && (res as any).token_type === 'totp') {
        // store token and show TOTP UI
        setTotpToken((res as any).access_token);
        setShowTOTP(true);
        return;
      }

      // otherwise login completed
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [showTOTP, setShowTOTP] = useState(false);
  const [totpToken, setTotpToken] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [isVerifyingTOTP, setIsVerifyingTOTP] = useState(false);

  const totpMutation = useMutation({
    mutationFn: ({ token, code }: { token: string; code: string }) => token2fa(token, code),
    onSuccess: async () => {
      await refreshAuth();
      navigate('/');
    },
  });

  const submitTOTP = async () => {
    if (!totpToken) {
      console.error('No TOTP token available');
      return;
    }
    setError('');
    try {
      setIsVerifyingTOTP(true);
      await totpMutation.mutateAsync({ token: totpToken, code: totpCode });
    } catch (err) {
      setError(err instanceof Error ? err.message : '2FA verification failed');
    } finally {
      setIsVerifyingTOTP(false);
    }
  };

  // Generate bubbles once on mount
  const bubbles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: 20 + Math.random() * 40,
      left: Math.random() * 100,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 5,
      drift: (Math.random() - 0.5) * 100,
    }));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-8 relative overflow-hidden">
      {/* Bubbles container */}
      <div className="absolute inset-0 pointer-events-none">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm"
            style={{
              left: `${bubble.left}%`,
              bottom: '-50px',
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animation: `bubble-rise ${bubble.duration}s infinite ease-in-out`,
              animationDelay: `${bubble.delay}s`,
              '--drift': `${bubble.drift}px`,
            } as React.CSSProperties & { '--drift': string }}
          />
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Kombuchalyzer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">Sign in to track your brews!</p>
        </div>

        {showTOTP ? (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Enter the 6-digit code from your authenticator app</div>
            <input
              type="text"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitTOTP(); }}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />

            <div className="flex items-center space-x-3">
              <button
                onClick={submitTOTP}
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600"
                disabled={isVerifyingTOTP}
              >
                {isVerifyingTOTP ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <button
                onClick={() => {
                  setShowTOTP(false);
                  setTotpToken(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="Enter your username"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold text-base hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          </form>
        )}
      </div>
    </div>
  );
}


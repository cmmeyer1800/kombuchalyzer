import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, getCurrentUser, logout } from '../utils/api';
import type { User } from '../utils/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<any>;
  // refreshAuth allows callers to re-check auth state after actions like 2FA
  refreshAuth: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // useQuery to keep current user in cache and drive auth state
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => apiLogin(username, password),
    onSuccess: (data: any) => {
      if (data && typeof data === 'object' && (data as any).token_type === 'totp') return;
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const handleLogin = async (username: string, password: string) => {
      const result = await loginMutation.mutateAsync({ username, password });
    if (result && typeof result === 'object' && (result as any).token_type !== 'totp') {
      navigate('/');
    }
    return result;
  };

  const refreshAuth = async () => {
    await refetch();
  };

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
    },
  });

  const handleLogout = async () => {
    // Clear client state and call logout endpoint
    await logoutMutation.mutateAsync();
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        isLoading,
        user: user ?? null,
        isAdmin: Boolean(user && user.role === 'admin'),
        login: handleLogin,
        refreshAuth,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


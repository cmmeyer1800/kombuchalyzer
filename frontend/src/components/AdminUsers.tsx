import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { getAllAdminUsers, createAdminUser, deleteAdminUser, type PaginatedUsers, type User } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const queryClient = useQueryClient();

  const { data, isLoading, error, isFetching } = useQuery<PaginatedUsers, Error, PaginatedUsers>({
    queryKey: ['admin', 'users', page, size],
    queryFn: () => getAllAdminUsers(page, size),
  });

  const users: User[] = data?.users || [];
  const total: number = data?.total || 0;

  // Create user form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // react-query handles loading; manual load no longer needed

  const handlePage = (next: number) => {
    if (next < 1) return;
    const last = Math.ceil(total / size) || 1;
    if (next > last) return;
    setPage(next);
    // react-query will fetch automatically based on page key
  };

  const createMutation = useMutation({
    mutationFn: (payload: { email: string; password?: string; role?: string }) => createAdminUser(payload),
    onSuccess: async () => {
      setEmail('');
      setPassword('');
      setRole('user');
      // refresh first page
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setPage(1);
    },
  });

  const { user: currentUser } = useAuth();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: async () => {
      setDeletingId(null);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    try {
      setCreating(true);
      await createMutation.mutateAsync({ email, password: password || undefined, role });
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create User</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">Email</label>
            <input
              className="mt-1 w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              type="email"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">Password</label>
            <input
              className="mt-1 w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              type="password"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">Role</label>
            <select
              className="mt-1 w-full border dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              {creating ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
        {createError && <div className="text-red-600 dark:text-red-400 mt-2">{createError}</div>}
      </section>

      <section className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Users</h3>

        {isLoading || isFetching ? (
          <div className="text-gray-600 dark:text-gray-400">Loading users…</div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400">{error?.message ?? String(error)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-600 dark:text-gray-400">
                  <th className="py-2">ID</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t dark:border-gray-600">
                    <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{u.id}</td>
                    <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{u.email}</td>
                    <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{u.role || 'user'}</td>
                    <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                      {u.id === currentUser?.id ? (
                        <span className="text-gray-500 dark:text-gray-400">(you)</span>
                      ) : (
                        <button
                          onClick={() => {
                            if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
                            setDeletingId(u.id);
                            deleteMutation.mutate(u.id);
                          }}
                          disabled={deletingId !== null}
                          className="px-2 py-1 bg-red-600 dark:bg-red-500 text-white rounded disabled:opacity-50 cursor-pointer hover:bg-red-700 dark:hover:bg-red-600"
                        >
                          {deletingId === u.id ? 'Deleting…' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total: {total} | Per Page: {size}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePage(page - 1)}
                  disabled={page <= 1}
                  className={`px-3 py-1 border dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ${page <= 1 ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  Prev
                </button>
                <div className="text-sm text-gray-600 dark:text-gray-400">Page {page} / {Math.max(1, Math.ceil(total / size) || 1)}</div>
                <button
                  onClick={() => handlePage(page + 1)}
                  disabled={page >= Math.ceil(total / size)}
                  className={`px-3 py-1 border dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ${page >= Math.ceil(total / size) ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// In production, use relative URLs (nginx will proxy /api to backend)
// In development, use absolute URL to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost' : '');

export interface User {
  id: string;
  email: string;
  // backend returns whether TOTP is enabled for the user
  totp_enabled?: boolean;
  // optional role returned by /api/auth/me (e.g. 'admin')
  role?: string;
}

export async function login(username: string, password: string): Promise<any> {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    credentials: 'include', // Important for cookies
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(error.detail || 'Login failed');
  }

  // return the parsed JSON so the caller can inspect token_type (e.g., 'totp')
  return response.json();
}

export async function token2fa(token: string, code: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/token-2fa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ access_token: token, code }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '2FA verification failed' }));
    throw new Error(error.detail || '2FA verification failed');
  }

  return;
}

export async function  getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    return null;
  }
}

export async function logout(): Promise<null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      // TODO: Handle error better
      return null;
    }

    return null;
  } catch (error) {
    // TODO: Handle error better
    return null;
  }
}

export async function enableTOTP(code: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/otp/enable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to enable TOTP' }));
    throw new Error(error.detail || 'Failed to enable TOTP');
  }

  return;
}

export async function disableTOTP(code: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/otp/disable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to disable TOTP' }));
    throw new Error(error.detail || 'Failed to disable TOTP');
  }

  return;
}

// Admin endpoints
export interface PaginatedUsers {
  users: User[];
  total: number;
}
  
export async function getAllAdminUsers(page = 1, size = 20): Promise<PaginatedUsers> {
  const response = await fetch(`${API_BASE_URL}/api/admin/user/all?skip=${(page-1) * size}&limit=${size}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch users' }));
    throw new Error(error.detail || 'Failed to fetch users');
  }

  return response.json();
}

export interface CreateUserPayload {
  email: string;
  password?: string;
  role?: string;
}

export async function createAdminUser(payload: CreateUserPayload): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/admin/user/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create user' }));
    throw new Error(error.detail || 'Failed to create user');
  }

  return response.json();
}

// Delete an admin user by id
export async function deleteAdminUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/user/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete user' }));
    throw new Error(error.detail || 'Failed to delete user');
  }

  return;
}


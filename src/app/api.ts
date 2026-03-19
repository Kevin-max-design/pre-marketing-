const API_BASE_URL = 'http://localhost:3001/api';

export const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
};

export const signup = async (data: {
  email: string;
  name: string;
  role: string;
  city?: string;
  industry?: string;
  investmentRange?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Signup failed');
  return result;
};

export const login = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Login failed');
  return result;
};

export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const fetchUser = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

export const updateUser = async (id: number, data: Record<string, string>) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update user');
  return response.json();
};

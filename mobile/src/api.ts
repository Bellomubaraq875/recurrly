import { API_URL } from './config';
import { Plans, Stats, Subscription, SubscriptionInput, User } from './types';

let token: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const setToken = (value: string | null) => {
  token = value;
};

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const request = async <T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError('Network error. Check your connection and try again.', 0);
  }
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!response.ok) {
    if (response.status === 401 && token && unauthorizedHandler) unauthorizedHandler();
    throw new ApiError(data?.message ?? 'Request failed', response.status, data?.code);
  }
  return data as T;
};

interface AuthResponse {
  token: string;
  user: User;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string }) => request<AuthResponse>('/auth/login', { method: 'POST', body }),
  me: () => request<{ user: User }>('/auth/me'),
  updateMe: (body: Partial<Pick<User, 'name' | 'currency' | 'reminderDaysBefore'>>) =>
    request<{ user: User }>('/auth/me', { method: 'PATCH', body }),
  deleteAccount: () => request<{ ok: boolean }>('/auth/me', { method: 'DELETE' }),
  addPushToken: (pushToken: string) =>
    request<{ ok: boolean }>('/auth/push-token', { method: 'POST', body: { token: pushToken } }),
  removePushToken: (pushToken: string) =>
    request<{ ok: boolean }>('/auth/push-token/remove', { method: 'POST', body: { token: pushToken } }),
  listSubscriptions: () => request<{ subscriptions: Subscription[] }>('/subscriptions'),
  getSubscription: (id: string) => request<{ subscription: Subscription }>(`/subscriptions/${id}`),
  createSubscription: (body: SubscriptionInput) =>
    request<{ subscription: Subscription }>('/subscriptions', { method: 'POST', body }),
  updateSubscription: (id: string, body: SubscriptionInput) =>
    request<{ subscription: Subscription }>(`/subscriptions/${id}`, { method: 'PUT', body }),
  deleteSubscription: (id: string) => request<{ ok: boolean }>(`/subscriptions/${id}`, { method: 'DELETE' }),
  stats: () => request<Stats>('/stats'),
  plans: () => request<Plans>('/payments/plans'),
  initializePayment: (plan: 'monthly' | 'yearly') =>
    request<{ authorizationUrl: string; reference: string }>('/payments/initialize', { method: 'POST', body: { plan } }),
  verifyPayment: (reference: string) =>
    request<{ success: boolean; user: User }>('/payments/verify', { method: 'POST', body: { reference } }),
};

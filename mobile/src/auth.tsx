import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, setToken, setUnauthorizedHandler } from './api';
import { registerForPushNotifications } from './notifications';
import { clearStoredToken, getStoredToken, storeToken } from './storage';
import { User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, 'name' | 'currency' | 'reminderDaysBefore'>>) => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pushToken = useRef<string | null>(null);

  const clearSession = useCallback(async () => {
    setToken(null);
    pushToken.current = null;
    await clearStoredToken();
    setUser(null);
  }, []);

  const syncPush = useCallback(async () => {
    const value = await registerForPushNotifications();
    if (!value) return;
    pushToken.current = value;
    await api.addPushToken(value).catch(() => undefined);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
    const boot = async () => {
      const stored = await getStoredToken();
      if (stored) {
        setToken(stored);
        try {
          const { user: me } = await api.me();
          setUser(me);
          syncPush();
        } catch {
          await clearSession();
        }
      }
      setLoading(false);
    };
    boot();
    return () => setUnauthorizedHandler(null);
  }, [clearSession, syncPush]);

  const startSession = useCallback(
    async (result: { token: string; user: User }) => {
      await storeToken(result.token);
      setToken(result.token);
      setUser(result.user);
      syncPush();
    },
    [syncPush]
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      setUser,
      login: async (email, password) => startSession(await api.login({ email, password })),
      register: async (name, email, password) => startSession(await api.register({ name, email, password })),
      logout: async () => {
        if (pushToken.current) await api.removePushToken(pushToken.current).catch(() => undefined);
        await clearSession();
      },
      deleteAccount: async () => {
        await api.deleteAccount();
        await clearSession();
      },
      updateProfile: async (patch) => {
        const { user: updated } = await api.updateMe(patch);
        setUser(updated);
      },
    }),
    [user, loading, startSession, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

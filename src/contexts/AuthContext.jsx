import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

async function requestJson(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    throw new Error('Could not reach the account service. Start the app with Cloudflare Pages Dev and a D1 database.');
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('The account service is not configured for this site yet.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await requestJson('/api/auth/me');
      setUser(data.user);
      return data.user;
    } catch (error) {
      setUser(null);
      if (error.message === 'Sign in to continue.') return null;
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signIn = useCallback(async (credentials) => {
    const data = await requestJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setUser(data.user);
    return data.user;
  }, []);

  const signUp = useCallback(async (details) => {
    const data = await requestJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(details),
    });
    setUser(data.user);
    return data.user;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await requestJson('/api/auth/logout', { method: 'POST', body: '{}' });
    } catch {
      // Clear the local account view even if the session endpoint is temporarily unavailable.
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut, refreshUser }), [user, loading, signIn, signUp, signOut, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}

export { requestJson };

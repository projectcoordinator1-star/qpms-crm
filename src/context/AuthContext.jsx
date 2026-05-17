import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './auth-context.js';

const authStorageKey = 'qpms-crm-auth-user';

function readStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    const savedUser = window.localStorage.getItem(authStorageKey);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    if (!user) {
      window.localStorage.removeItem(authStorageKey);
      return;
    }

    window.localStorage.setItem(authStorageKey, JSON.stringify(user));
  }, [user]);

  function logout() {
    setUser(null);
  }

  const value = useMemo(() => ({ user, setUser, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

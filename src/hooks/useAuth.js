import { useCallback, useState } from 'react';

const ACCOUNTS_KEY = 'dukie:accounts:v1';
const SESSION_KEY = 'dukie:session:v1';

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

async function hashPassword(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function createId() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useAuth() {
  const [user, setUser] = useState(() => {
    const session = readJson(SESSION_KEY, null);
    if (!session) return null;
    const account = readJson(ACCOUNTS_KEY, []).find((item) => item.id === session.userId);
    return account ? { id: account.id, name: account.name, email: account.email } : null;
  });

  const login = useCallback(async ({ email, password }) => {
    const normalizedEmail = email.trim().toLocaleLowerCase('pt-BR');
    const account = readJson(ACCOUNTS_KEY, []).find((item) => item.email === normalizedEmail);
    if (!account || await hashPassword(password, account.salt) !== account.passwordHash) {
      throw new Error('E-mail ou senha incorretos.');
    }
    const safeUser = { id: account.id, name: account.name, email: account.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: account.id }));
    setUser(safeUser);
    return safeUser;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const accounts = readJson(ACCOUNTS_KEY, []);
    const normalizedEmail = email.trim().toLocaleLowerCase('pt-BR');
    if (accounts.some((item) => item.email === normalizedEmail)) {
      throw new Error('Já existe uma conta com este e-mail.');
    }
    const salt = createId();
    const account = {
      id: createId(),
      name: name.trim(),
      email: normalizedEmail,
      salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: account.id }));
    const safeUser = { id: account.id, name: account.name, email: account.email };
    setUser(safeUser);
    return safeUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return { user, login, register, logout };
}

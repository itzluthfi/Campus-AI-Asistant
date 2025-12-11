import { UserSession } from '../types';

const SESSION_KEY = 'campus_ai_session';

export const saveSession = (user: UserSession, rememberMe: boolean) => {
  if (rememberMe) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
};

export const getSession = (): UserSession | null => {
  // Cek LocalStorage (Remember Me)
  let data = localStorage.getItem(SESSION_KEY);
  if (!data) {
    // Cek SessionStorage (Temporary)
    data = sessionStorage.getItem(SESSION_KEY);
  }
  
  if (data) {
    try {
      return JSON.parse(data) as UserSession;
    } catch (e) {
      console.error("Session corrupt", e);
      return null;
    }
  }
  return null;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};
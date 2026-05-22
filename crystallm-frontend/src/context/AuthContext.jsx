import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('crystallm_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const userData = { ...data.user, token: data.token };
        setUser(userData);
        localStorage.setItem('crystallm_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: data.message || 'Login failed.' };
    } catch (error) { return { success: false, error: 'Network error. Backend unreachable.' }; }
  };

  const register = async (name, email, password, dob) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, dob }) 
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const userData = { ...data.user, token: data.token };
        setUser(userData);
        localStorage.setItem('crystallm_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: data.message || 'Registration failed.' };
    } catch (error) { return { success: false, error: 'Network error. Backend unreachable.' }; }
  };

  const resetPassword = async (email, dob, newPassword) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, dob, newPassword }) 
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') return { success: true, message: data.message };
      return { success: false, error: data.message || 'Reset failed.' };
    } catch (error) { return { success: false, error: 'Network error. Backend unreachable.' }; }
  };

  // NEW: Update user state instantly when uploading profile pic
  const updateUser = (newUserData) => {
    const updated = { ...user, ...newUserData };
    setUser(updated);
    localStorage.setItem('crystallm_user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crystallm_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, resetPassword, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
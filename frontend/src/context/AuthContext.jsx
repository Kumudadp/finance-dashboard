import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    if (token) setUser({ token, role, email });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const token = res.data.access_token;
    const payload = JSON.parse(atob(token.split('.')[1]));
    localStorage.setItem('token', token);
    localStorage.setItem('role', payload.role);
    localStorage.setItem('email', email);
    setUser({ token, role: payload.role, email });
    return payload.role;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

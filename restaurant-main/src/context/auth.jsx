import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Në mount, lexo token & user nga storage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      
      // Set token in axios defaults
      api.defaults.headers.common['x-auth-token'] = token;
    }
  }, []);

  const login = async (email, password, isAdmin) => {
    try {
      const url = isAdmin ? '/auth/login' : '/auth/login'; // ose `/auth/loginStaff`
      const { data } = await api.post(url, { email, password });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Set token in axios defaults
      api.defaults.headers.common['x-auth-token'] = data.token;
      
      setUser(data.user);
      
      // Redirect bazuar në rol:
      if (data.user.role === 'admin') navigate('/admin/manager');
      else navigate('/dashboard/waiter');
      
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove token from axios defaults
    delete api.defaults.headers.common['x-auth-token'];
    
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

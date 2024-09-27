import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login, register, getUser, updateProjects } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectWindows, setProjectWindows] = useState({});

  const loadUserData = useCallback(async (token) => {
    try {
      const userData = await getUser(token);
      if (userData) {
        setUser(userData);
        setProjects(userData.projects || []);
        const windows = {};
        userData.projects.forEach(project => {
          windows[project.id] = project.windows || [];
        });
        setProjectWindows(windows);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      handleLogout();
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserData(token);
    }
    setLoading(false);
  }, [loadUserData]);

  const handleLogin = async (email, password) => {
    try {
      const data = await login(email, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        await loadUserData(data.token);
        return true;
      } else {
        throw new Error('Login failed: No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setProjects([]);
    setProjectWindows({});
    return true;
  }, []);

  const handleRegister = async (name, email, password) => {
    try {
      const data = await register(name, email, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        await loadUserData(data.token);
        return true;
      } else {
        throw new Error('Registration failed: No token received');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const saveUserData = async () => {
    const token = localStorage.getItem('token');
    if (token && user) {
      const projectsData = projects.map(project => ({
        ...project,
        windows: projectWindows[project.id] || []
      }));
      await updateProjects(token, projectsData);
      setUser(prevUser => ({ ...prevUser, projects: projectsData }));
    }
  };

  const value = {
    user,
    loading,
    projects,
    setProjects,
    projectWindows,
    setProjectWindows,
    handleLogin,
    handleLogout,
    handleRegister,
    saveUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
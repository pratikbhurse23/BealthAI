import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as localAuth from './localAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // initialize from local storage (localAuth)
    (async () => {
      try {
        const current = await localAuth.me();
        if (current) {
          setUser(current);
          setIsAuthenticated(true);
        } else {
          // If there's no user, only redirect to /Login when the user is
          // not already on a public auth route (Login or Signup). This
          // prevents an automatic redirect that interferes with navigation
          // to the Signup page when clicking "Create account".
          const publicPaths = ['/Login', '/Signup'];
          const pathname = (typeof window !== 'undefined' && window.location && window.location.pathname) || '/';
          if (!publicPaths.includes(pathname)) {
            navigate('/Login');
          }
        }
      } catch (err) {
        console.error('Auth init error', err);
      } finally {
        setIsLoadingAuth(false);
      }
    })();
  }, [navigate]);

  const logout = () => {
    localAuth.logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/Login');
  };

  const login = async (email, password) => {
    setIsLoadingAuth(true);
    try {
      const u = await localAuth.login(email, password);
      setUser(u);
      setIsAuthenticated(true);
      navigate('/');
      return u;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signup = async (data) => {
    setIsLoadingAuth(true);
    try {
      const u = await localAuth.signup(data);
      setUser(u);
      setIsAuthenticated(true);
      navigate('/');
      return u;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const navigateToLogin = () => navigate('/Login');

  const checkAppState = async () => { return; };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      logout,
      login,
      signup,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

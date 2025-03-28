import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_KEYCLOAK_ADAPTER_URL } from '../config'; 

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  roles: string[];
  userName: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    expiresIn: null,
    roles: [],
    userName: null,
    userId: null,
    loading: true,
    error: null,
  });

  const setAxiosAuthHeader = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const isTokenExpiringSoon = (token: string): boolean => {
    try {
      const decoded = jwtDecode<any>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp - currentTime < 300; 
    } catch {
      return true;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(
        `${API_KEYCLOAK_ADAPTER_URL}/token`, // CAMBIADO
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: authState.refreshToken!,
          client_id: 'proyecto-h',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      const decodedToken = jwtDecode<any>(access_token);
      const userRoles = decodedToken.realm_access?.roles || [];
      const isAdmin = userRoles.includes('admin');

      await AsyncStorage.multiSet([
        ['accessToken', access_token],
        ['refreshToken', refresh_token],
        ['expiresIn', expires_in.toString()],
      ]);

      setAxiosAuthHeader(access_token);
      setAuthState(prev => ({
        ...prev,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        roles: isAdmin ? ['admin'] : ['user'],
      }));

      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await logout();
      throw error;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${API_KEYCLOAK_ADAPTER_URL}/login`, // CAMBIADO
        new URLSearchParams({
          username,
          password,
          client_id: 'proyecto-h',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded'
         }, 
         withCredentials: true
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      const decodedToken = jwtDecode<any>(access_token);

      console.log('Decoded token:', decodedToken);
      console.log('Roles from token:', decodedToken.realm_access?.roles);

      const userRoles = decodedToken.realm_access?.roles || [];
      const isAdmin = userRoles.includes('admin');

      await AsyncStorage.multiSet([
        ['accessToken', access_token],
        ['refreshToken', refresh_token],
        ['expiresIn', expires_in.toString()],
      ]);

      setAxiosAuthHeader(access_token);
      setAuthState({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        roles: isAdmin ? ['admin'] : ['user'],
        userName: decodedToken.preferred_username,
        userId: decodedToken.sub,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Error durante el inicio de sesión',
        loading: false,
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'expiresIn']);
      setAxiosAuthHeader(null);
      setAuthState({
        accessToken: null,
        refreshToken: null,
        expiresIn: null,
        roles: [],
        userName: null,
        userId: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [[, accessToken], [, refreshToken], [, expiresIn]] = await AsyncStorage.multiGet([
          'accessToken',
          'refreshToken',
          'expiresIn',
        ]);

        if (accessToken && refreshToken) {
          if (isTokenExpiringSoon(accessToken)) {
            await refreshAccessToken();
          } else {
            const decodedToken = jwtDecode<any>(accessToken);
            const userRoles = decodedToken.realm_access?.roles || [];
            const isAdmin = userRoles.includes('admin');

            setAxiosAuthHeader(accessToken);
            setAuthState({
              accessToken,
              refreshToken,
              expiresIn: parseInt(expiresIn || '0', 10),
              roles: isAdmin ? ['admin'] : ['user'],
              userName: decodedToken.preferred_username,
              userId: decodedToken.sub,
              loading: false,
              error: null,
            });
          }
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newTokens = await refreshAccessToken();
            originalRequest.headers['Authorization'] = `Bearer ${newTokens.access_token}`;
            return axios(originalRequest);
          } catch {
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  if (authState.loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        isAuthenticated: !!authState.accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
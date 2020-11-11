import React, { createContext, useCallback, useContext, useState } from 'react';
import api from '../services/apiClient';

interface AuthState {
  token: string;
  mappedUser: object;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  mappedUser: object;
  signIn(credentials: SignInCredentials): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@GoBarber:token');
    const mappedUser = localStorage.getItem('@GoBarber:mappedUser');

    if (token && mappedUser) {
      return { token, mappedUser: JSON.parse(mappedUser) };
    }

    return {} as AuthState;
  });

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, mappedUser } = response.data;

    localStorage.setItem('@GoBarber:token', token);
    localStorage.setItem('@GoBarber:mappedUser', JSON.stringify(mappedUser));

    setData({ token, mappedUser });
  }, []);

  return (
    <AuthContext.Provider value={{ mappedUser: data.mappedUser, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
import React, {
  createContext, useCallback, useContext, useEffect, useState,
} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';

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
  loading: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>({} as AuthState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoragedData(): Promise<void> {
      const [token, mappedUser] = await AsyncStorage.multiGet([
        '@GoBarber:token',
        '@GoBarber:mappedUser',
      ]);

      if (token[1] && mappedUser[1]) {
        setData({ token: token[1], mappedUser: JSON.parse(mappedUser[1]) });
      }

      setLoading(false);
    }

    loadStoragedData();
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, mappedUser } = response.data;

    await AsyncStorage.multiSet([
      ['@GoBarber:token', token],
      ['@GoBarber:mappedUser', JSON.stringify(mappedUser)],
    ]);

    setData({ token, mappedUser });
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove([
      '@GoBarber:token',
      '@GoBarber:mappedUser',
    ]);

    setData({} as AuthState);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        mappedUser: data.mappedUser, loading, signIn, signOut,
      }}
    >
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

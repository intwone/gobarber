import React from 'react';
import { View, ActivityIndicator } from 'react-native';

import AuthRoutes from './auth.routes';
import AppRoutes from './app.routes';

import { useAuth } from '../hooks/auth';

const Routes: React.FC = () => {
  const { mappedUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent:
        'center',
        alignItems: 'center',
      }}
      >
        <ActivityIndicator size="large" color="#999" />
      </View>
    );
  }

  return mappedUser ? <AppRoutes /> : <AuthRoutes />;
};

export default Routes;

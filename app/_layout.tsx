import { Slot, useSegments, useRootNavigationState, router } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

type ValidSegment = 'login' | 'admin' | 'index' | '(tabs)' | '+not-found';

function RootLayoutNav() {
  const { isAuthenticated, roles } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const currentSegment = segments.length > 0 ? (segments[0] as ValidSegment) : '';

    const handleNavigation = () => {
      if (!isAuthenticated) {
        if (currentSegment !== 'login') {
          router.replace('/login');
        }
      } else {
        const isAdmin = roles.includes('admin');
        if (isAdmin) {
          if (currentSegment !== 'admin') {
            router.replace('/admin');
          }
        } else {
          if (!currentSegment || currentSegment !== 'index') {
            router.replace('/');
          }
        }
      }
    };

    handleNavigation();
  }, [isAuthenticated, navigationState?.key, segments, roles]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
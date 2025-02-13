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
        // Si no está autenticado, redirige al login
        if (currentSegment !== 'login') {
          router.replace('/login');
        }
      } else {
        const isAdmin = roles.includes('admin');
        if (isAdmin) {
          // El admin tiene acceso a todo el sistema, no se fuerza ninguna redirección
          if (currentSegment === 'login') {
            router.replace('/admin'); // Redirige al admin a su dashboard
          }
        } else {
          // Usuarios normales solo pueden acceder a '/' o rutas específicas
          const allowedSegments = ['index', '(tabs)']; // Rutas permitidas para usuarios normales
          if (!allowedSegments.includes(currentSegment)) {
            router.replace('/'); // Redirige a la ruta raíz
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
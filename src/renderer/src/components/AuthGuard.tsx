import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
 import { useAppStore } from '@renderer/store'

interface AuthGuardProps {
  children?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = useAppStore((state) => state.user)

  // Get login state safely
  useEffect(() => {
    try {
      if (!window.store) {
        setError('Store API not available');
        return;
      }
      // AuthCallback should only set the accesstoken then navigate to dashboard

      // AuthGuard should call the login method!!! which will define if user is logged in or need to set license or in invalid...

      setIsLoggedIn(!!user?.isLoggedIn);
    } catch (err:any) {
      setError(`Authentication error: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    // Set up a listener for app state changes to handle logout
    try {
      if (!window.store) {
        return;
      }

      const handleAppStateChange = (state: any) => {
        setIsLoggedIn(!!state.user?.isLoggedIn);

        if (!state.user?.isLoggedIn && location.pathname !== '/login') {
          navigate('/login');
        }
      };

      // Add listener for app state updates
      window.store.onAppStateUpdate(handleAppStateChange);

      // Add listener for combined state updates (this is what broadcastState triggers)
      window.store.onStateUpdate((_sessionState, appState) => {
        handleAppStateChange(appState);
      });

      return () => {};
    } catch (err:any) {
      setError(`Listener error: ${err!.message}`);
    }
  }, [navigate, location.pathname]);

  // Show loading state while checking authentication
  if (isLoggedIn === null && !error) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-300">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Show error state if there was a problem
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-base-300 p-4 text-center">
        <h1 className="text-2xl font-bold text-error mb-4">Authentication Error</h1>
        <p className="mb-4">{error}</p>
        <p className="text-sm opacity-70">Please check the console for more details or try restarting the application.</p>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render children or outlet
  return <>{children || <Outlet />}</>;
};

export default AuthGuard;

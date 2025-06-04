import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LoadingPage } from '@renderer/pages/loadingPage';

export function AuthCallbackPage() {
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const handleAuth = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const accessToken = queryParams.get('access_token');
        const refreshToken = queryParams.get('refresh_token');
        const expiresIn = queryParams.get('expires_in');

        if (!accessToken) {
          throw new Error('No access token found in callback URL');
        }

        // Calculate expiration time if expires_in is provided
        const expirationTime = expiresIn
          ? Date.now() + parseInt(expiresIn) * 1000
          : null;

        // Send tokens to main process
        const result = await window.store.login(
          accessToken,
          refreshToken,
          expirationTime
        );

        if (result.success) {
          window.location.href = '/#/';
        } else {
          throw new Error(result.error || 'Login failed');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/#/login';
        }, 3000);
      }
    };

    handleAuth();
  }, []);

  return <LoadingPage error={error} />;
}

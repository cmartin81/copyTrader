import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleFakeLogin = async () => {
    try {
      // Set loading state to show spinner
      setIsLoading(true);

      // Call the main process login method
      const result = await window.store.login();

      if (result.success) {
        // Navigate to dashboard on success
        navigate('/');
      } else {
        console.error('Login failed:', result.error);
        // You could show an error message here
      }
    } catch (error) {
      console.error('Error during login:', error);
      // You could show an error message here
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-base-100 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">CopyTrader</h1>
          <p className="mt-2 text-base-content/70">You are not logged in</p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleFakeLogin}
            className="w-full btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Logging in...
              </>
            ) : (
              'Fake Login'
            )}
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-base-content/50">
          <p>This is a placeholder login page.</p>
          <p>OAuth integration with Whop will be implemented later.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

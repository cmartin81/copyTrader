import React from "react";

interface LoadingPageProps {
  error?: string | null;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ error }) => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {error ? 'Oops!' : 'Hang Tight!'}
      </h1>
      {error ? (
        <p style={styles.error}>{error}</p>
      ) : (
        <p style={styles.feedback}>Your access is being prepared. 🎯</p>
      )}
      {!error && <div className="spinner"></div>}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '24px',
    marginBottom: '10px',
  },
  feedback: {
    fontSize: '16px',
    color: '#bbb',
    marginBottom: '20px',
  },
  error: {
    fontSize: '16px',
    color: '#ff6b6b',
    marginBottom: '20px',
    maxWidth: '80%',
    textAlign: 'center',
  },
};

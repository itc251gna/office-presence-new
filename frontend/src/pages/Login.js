import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        navigate('/dashboard', { replace: true });
      } catch (error) {
        setChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Φόρτωση...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              251 ΓΝΑ
            </h1>
            <h2 className="text-xl font-semibold text-slate-700">
              Κέντρο Μηχανογράφησης
            </h2>
            <p className="text-slate-600 text-base mt-4">
              Σύστημα Διαχείρισης Παρουσιών
            </p>
          </div>

          <div className="mt-12 space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-slate-500 uppercase tracking-wider">
                Σύνδεση στην εφαρμογή
              </p>
              <Button
                data-testid="google-login-button"
                onClick={handleLogin}
                size="lg"
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-6 rounded-lg shadow-sm transition-all hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Σύνδεση με Google
              </Button>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-400 text-center leading-relaxed">
                Συνδεθείτε για να δηλώσετε τις ημέρες παρουσίας σας<br />
                και να δείτε το ημερολόγιο της ομάδας.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero Image */}
      <div
        className="hidden lg:block lg:w-3/5 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxJVCUyMHNlcnZlciUyMHJvb20lMjBkYXRhJTIwY2VudGVyJTIwdGVjaG5vbG9neXxlbnwwfHx8fDE3NjUyNjQzNDJ8MA&ixlib=rb-4.1.0&q=85)'
        }}
      >
        <div className="h-full w-full bg-slate-900/20 backdrop-blur-[0.5px]" />
      </div>
    </div>
  );
};

export default Login;
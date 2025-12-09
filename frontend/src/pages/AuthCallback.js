import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const processing = useRef(false);

  useEffect(() => {
    if (processing.current) return;
    processing.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error('Σφάλμα αυθεντικοποίησης');
          navigate('/', { replace: true });
          return;
        }

        // Call backend to process session
        const response = await axios.post(
          `${BACKEND_URL}/api/auth/callback`,
          { session_id: sessionId },
          { withCredentials: true }
        );

        // Mark as just authenticated to skip delay in ProtectedRoute
        sessionStorage.setItem('just_authenticated', 'true');

        // Redirect to dashboard with user data
        navigate('/dashboard', { 
          replace: true, 
          state: { user: response.data.user } 
        });
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Αποτυχία σύνδεσης');
        navigate('/', { replace: true });
      }
    };

    processAuth();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-slate-600">Επεξεργασία σύνδεσης...</div>
    </div>
  );
};

export default AuthCallback;
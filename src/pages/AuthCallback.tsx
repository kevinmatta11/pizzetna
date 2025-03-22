
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get code and session_token from URL, if available
        const hash = window.location.hash;
        
        if (hash) {
          // Handle OAuth callback
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data.session) {
            const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
            
            if (redirectAfterLogin === 'spin-wheel') {
              localStorage.removeItem('redirectAfterLogin');
              
              toast.success("Sign in successful! You can now spin the wheel.");
              navigate('/loyalty?tab=wheel');
            } else {
              toast.success("Sign in successful!");
              navigate('/');
            }
          } else {
            toast.error("Authentication failed. Please try again.");
            navigate('/auth');
          }
        } else {
          // No hash, redirect to auth page
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error during authentication callback:', error);
        toast.error("Authentication failed. Please try again.");
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Completing sign in...</h2>
      <div className="w-16 h-16 border-4 border-brunch-400 border-t-brunch-600 rounded-full animate-spin"></div>
    </div>
  );
};

export default AuthCallback;

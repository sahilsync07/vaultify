import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { jwtDecode } from 'jwt-decode';
import GlassCard from '../components/ui/GlassCard';

const Login: React.FC = () => {
  const { setUser } = useAuthStore();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    /* global google */
    if (window.google && clientId) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          const userObject: any = jwtDecode(response.credential);
          setUser({
            email: userObject.email,
            name: userObject.name,
            picture: userObject.picture
          });
        }
      });

      window.google.accounts.id.renderButton(
        document.getElementById('googleSignIn'),
        { theme: 'filled_black', size: 'large', shape: 'pill', width: '100%' }
      );
    }
  }, [clientId, setUser]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      <GlassCard className="w-full max-w-md relative z-10 p-8 md:p-12 border-white/20">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-neon">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-3 gradient-text">Vaultify</h1>
          <p className="text-gray-400">Secure Family Document Vault</p>
        </div>

        <div className="space-y-6">
          <div id="googleSignIn" className="flex justify-center h-[50px]"></div>

          <div className="text-center text-sm text-gray-500 mt-6">
            <p>Protected by end-to-end encryption</p>
            <p className="mt-1">Access restricted to authorized family members</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;
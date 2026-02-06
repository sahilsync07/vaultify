import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { jwtDecode } from 'jwt-decode';

declare global {
  interface Window {
    google: any;
  }
}

const Login: React.FC = () => {
  const { setUser } = useAuthStore();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const handleCallbackResponse = (response: any) => {
      const userObject: any = jwtDecode(response.credential);
      setUser({
        email: userObject.email,
        name: userObject.name,
        picture: userObject.picture
      });
    };

    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: handleCallbackResponse
    });

    window.google?.accounts.id.renderButton(
      document.getElementById('googleSignIn'),
      { theme: 'outline', size: 'large', shape: 'pill' }
    );
  }, [setUser, clientId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>

      <div className="glass-card max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg animate-float">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text">Vaultify</h1>
          <p className="text-gray-400">Secure Personal Vault for the Family</p>
        </div>

        <div className="p-4 border border-dashed border-white/10 rounded-xl bg-white/5">
          <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest font-semibold">Authorized Access Only</p>
          <div id="googleSignIn" className="flex justify-center"></div>
        </div>

        <div className="pt-4">
          <p className="text-xs text-gray-600">
            Authenticated family members: patrosln07, chitishreedevi1977, sahilsync07, suryainsingham2
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
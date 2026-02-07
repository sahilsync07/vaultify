import { create } from 'zustand';

interface User {
    email: string;
    name: string;
    picture: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    allowedEmails: string[];
    setUser: (user: User | null) => void;
    setAccessToken: (token: string | null) => void;
    logout: () => void;
}

const AUTHORIZED_EMAILS = [
    'patrosln07@gmail.com',
    'chitishreedevi1977@gmail.com',
    'sahilsync07@gmail.com',
    'suryainsingham2@gmail.com'
];

import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            allowedEmails: AUTHORIZED_EMAILS,
            setUser: (user) => {
                if (user && AUTHORIZED_EMAILS.includes(user.email.toLowerCase())) {
                    set({ user, isAuthenticated: true });
                } else {
                    set({ user: null, isAuthenticated: false, accessToken: null });
                }
            },
            setAccessToken: (token) => set({ accessToken: token }),
            logout: () => {
                set({ user: null, isAuthenticated: false, accessToken: null });
                localStorage.removeItem('auth-storage');
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                accessToken: state.accessToken,
            }),
        }
    )
);

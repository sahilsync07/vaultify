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

export const useAuthStore = create<AuthState>((set) => ({
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
    logout: () => set({ user: null, isAuthenticated: false, accessToken: null }),
}));

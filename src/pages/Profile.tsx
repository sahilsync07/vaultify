import React from 'react';
import AppLayout from '../layouts/AppLayout';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Profile: React.FC = () => {
    const { user, logout } = useAuthStore();

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold gradient-text">My Profile</h1>

                <Card variant="glass" className="p-8 space-y-6">
                    <div className="flex items-center gap-6">
                        {user?.picture ? (
                            <img src={user.picture} alt={user.name} className="w-24 h-24 rounded-full border-2 border-primary shadow-neon" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-2 border-white/10">
                                <span className="text-3xl font-bold text-muted-foreground">{user?.name?.charAt(0)}</span>
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                            <p className="text-muted-foreground">{user?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/20">
                                {user?.email === 'sahilsync07@gmail.com' ? 'Administrator' : 'User'}
                            </span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-4">
                        <div className="bg-white/5 p-4 rounded-xl">
                            <h3 className="text-sm font-medium text-white mb-1">Account Type</h3>
                            <p className="text-sm text-muted-foreground">Google OAuth 2.0 Connected</p>
                        </div>

                        <Button variant="danger" onClick={logout} className="w-full justify-center">
                            Sign Out
                        </Button>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Profile;

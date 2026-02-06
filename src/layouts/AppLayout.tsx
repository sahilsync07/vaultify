import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    HomeIcon,
    FolderIcon,
    CloudArrowUpIcon,
    UserIcon,
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'My Files', path: '/files', icon: FolderIcon },
        { name: 'Upload', path: '/upload', icon: CloudArrowUpIcon },
        { name: 'Profile', path: '/profile', icon: UserIcon },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full p-6">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-neon">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <span className="text-2xl font-bold gradient-text tracking-tight">Vaultify</span>
            </div>

            <nav className="space-y-2 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                            isActive
                                ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                                : "text-muted-foreground hover:bg-white/5 hover:text-white"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon className="w-5 h-5 relative z-10" />
                                <span className="font-medium text-sm relative z-10">{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-4 backdrop-blur-sm">
                    {user?.picture ? (
                        <img src={user.picture} className="w-10 h-10 rounded-full border border-white/10" alt="User" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                    )}
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email || 'No email'}</p>
                    </div>
                </div>
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                    Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 h-full flex-col z-20 border-r border-white/5 bg-black/20 backdrop-blur-xl">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-card border-r border-white/10 z-50 md:hidden"
                        >
                            <SidebarContent />
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative bg-[url('/bg-grid.svg')] bg-fixed bg-cover">
                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-background/50 backdrop-blur-xl sticky top-0 z-30">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-white">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <span className="font-semibold text-white gradient-text">Vaultify</span>
                    <img src={user?.picture} className="w-8 h-8 rounded-full border border-white/10" alt="User" />
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden h-16 bg-background/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 pb-safe z-30">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                                isActive ? "text-primary bg-primary/5" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default AppLayout;

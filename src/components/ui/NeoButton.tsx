import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    children: ReactNode;
    icon?: ReactNode;
}

const NeoButton: React.FC<NeoButtonProps> = ({
    variant = 'primary',
    children,
    icon,
    className = '',
    ...props
}) => {
    const baseStyles = "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-neon hover:shadow-neon-hover",
        secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20",
        ghost: "hover:bg-white/5 text-gray-400 hover:text-white"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {icon && <span className="w-5 h-5">{icon}</span>}
            {children}
        </button>
    );
};

export default NeoButton;

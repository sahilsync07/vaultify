import React, { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = true }) => {
    return (
        <div
            className={`
        bg-glass backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300
        ${hoverEffect ? 'hover:bg-glassHousing hover:border-white/20 hover:shadow-lg hover:-translate-y-1' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export default GlassCard;

import React from 'react';
import { Tier, Division } from '../types';

interface RankEmblemProps {
  tier: Tier;
  division?: Division;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RankEmblem: React.FC<RankEmblemProps> = ({ tier, division, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-48 h-48',
  };

  const getColors = (t: Tier) => {
    switch (t) {
      case Tier.IRON: return ['#52525b', '#27272a', '#71717a'];
      case Tier.BRONZE: return ['#7c2d12', '#451a03', '#c2410c'];
      case Tier.SILVER: return ['#94a3b8', '#475569', '#cbd5e1'];
      case Tier.GOLD: return ['#f59e0b', '#78350f', '#fbbf24'];
      case Tier.PLATINUM: return ['#2dd4bf', '#0f766e', '#5eead4'];
      case Tier.EMERALD: return ['#10b981', '#064e3b', '#34d399'];
      case Tier.DIAMOND: return ['#06b6d4', '#164e63', '#67e8f9'];
      case Tier.MASTER: return ['#c084fc', '#581c87', '#d8b4fe'];
      case Tier.GRANDMASTER: return ['#f87171', '#7f1d1d', '#fca5a5'];
      case Tier.CHALLENGER: return ['#60a5fa', '#1e3a8a', '#93c5fd'];
      default: return ['#94a3b8', '#475569', '#cbd5e1'];
    }
  };

  const [main, dark, light] = getColors(tier);

  return (
    <div className={`relative flex flex-col items-center justify-center ${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        {/* Outer Shield */}
        <path d="M50 5 L90 20 L85 70 L50 95 L15 70 L10 20 Z" fill={dark} stroke={main} strokeWidth="2" />
        
        {/* Inner Detail */}
        <path d="M50 15 L80 25 L76 65 L50 85 L24 65 L20 25 Z" fill="transparent" stroke={light} strokeWidth="1" />
        
        {/* Core Gem */}
        <circle cx="50" cy="45" r="15" fill={main} className="animate-pulse" />
        <circle cx="50" cy="45" r="10" fill={light} opacity="0.5" />
        
        {/* Wings (Rank dependent complexity could go here) */}
        <path d="M10 20 Q 0 50 15 70" fill="none" stroke={main} strokeWidth="3" />
        <path d="M90 20 Q 100 50 85 70" fill="none" stroke={main} strokeWidth="3" />
      </svg>
      
      {division && (
        <div className="absolute -bottom-2 bg-slate-900 border border-amber-500/50 text-amber-100 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded shadow-lg">
          {division}
        </div>
      )}
    </div>
  );
};
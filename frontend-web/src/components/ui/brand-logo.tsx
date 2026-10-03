'use client';

import React from 'react';

interface BrandLogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
    textClassName?: string;
}

export function BrandLogo({
    className = 'w-9 h-9',
    size = 36,
    showText = false,
    textClassName = 'text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter',
}: BrandLogoProps) {
    return (
        <div className="flex items-center gap-2.5 shrink-0 group select-none">
            {/* SVG Logo Mark */}
            <svg
                width={size}
                height={size}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`rounded-xl shadow-xs transition-transform group-hover:scale-105 ${className}`}
            >
                <defs>
                    <linearGradient id="cictGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="100%" stopColor="#0369a1" />
                    </linearGradient>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                </defs>

                {/* Background Plate */}
                <rect width="48" height="48" rx="12" fill="url(#cictGrad)" />
                <rect x="2" y="2" width="44" height="44" rx="10" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" />

                {/* Graduation Cap Top (Màu trắng nổi bật) */}
                <path d="M24 11L41 18.5L24 26L7 18.5L24 11Z" fill="#FFFFFF" />

                {/* Cap Base (Màu xanh sáng) */}
                <path
                    d="M15 24V31.5C15 34.5 24 37 24 37C24 37 33 34.5 33 31.5V24L24 28L15 24Z"
                    fill="#E0F2FE"
                />

                {/* Tassel Link (Dải vàng cam biểu trưng liên kết thực tập) */}
                <path
                    d="M36 21V29.5C36 31 34 31.5 33 30.5"
                    stroke="url(#goldGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <circle cx="36" cy="30" r="2" fill="#FBBF24" />

                {/* Center Connection Node */}
                <circle cx="24" cy="18.5" r="2.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
            </svg>

            {showText && (
                <div className="flex items-center gap-1.5">
                    <span className={textClassName}>InternLink</span>
                    <span className="w-2 h-2 rounded-full bg-sky-500 inline-block shadow-glow-sky animate-pulse" />
                </div>
            )}
        </div>
    );
}

export default BrandLogo;

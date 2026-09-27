import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, leftIcon, rightIcon, disabled, type, ...props }, ref) => {
        return (
            <div className="w-full relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                        {leftIcon}
                    </div>
                )}
                <input
                    type={type}
                    ref={ref}
                    disabled={disabled}
                    className={cn(
                        "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors",
                        "focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
                        leftIcon && "pl-10",
                        rightIcon && "pr-10",
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        className
                    )}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center">
                        {rightIcon}
                    </div>
                )}
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, leftIcon, rightIcon, disabled, id, type, ...props }, ref) => {
        const generatedId = React.useId();
        const inputId = id || generatedId;

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
                        {label}
                        {props.required && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                )}
                <div className="w-full relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        type={type}
                        ref={ref}
                        disabled={disabled}
                        className={cn(
                            "flex h-10 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors",
                            "focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
                            leftIcon && "pl-10",
                            rightIcon && "pr-10",
                            error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20" : "border-slate-300",
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
                {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";

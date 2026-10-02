import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "danger" | "destructive";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default: "bg-sky-700 text-white hover:bg-sky-800 shadow-sm",
    primary: "bg-sky-700 text-white hover:bg-sky-800 shadow-sm",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700",
    ghost: "hover:bg-slate-100 text-slate-700",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
    destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-9 px-3.5 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            isLoading = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-semibold transition-all whitespace-nowrap",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
                    "disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer",
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

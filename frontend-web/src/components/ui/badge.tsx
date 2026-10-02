import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "primary" | "secondary" | "outline" | "success" | "warning" | "destructive" | "brand";
}

export function Badge({
    className,
    variant = "default",
    ...props
}: BadgeProps) {
    const variantClasses = {
        default: "border-transparent bg-slate-900 text-white hover:bg-slate-800",
        primary: "bg-blue-50 text-blue-700 border-blue-200",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border-transparent",
        outline: "text-slate-700 border-slate-200 hover:bg-slate-50",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        destructive: "bg-rose-50 text-rose-700 border-rose-200",
        brand: "bg-sky-50 text-sky-700 border-sky-200",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
                variantClasses[variant],
                className
            )}
            {...props}
        />
    );
}

import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white shadow-2xs",
                className
            )}
        >
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
                {icon || <FolderOpen className="w-6 h-6" />}
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
            {description && (
                <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
                    {description}
                </p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}

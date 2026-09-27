import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, hint, id, ...props }, ref) => {
        const generatedId = React.useId();
        const textareaId = id || generatedId;

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700">
                        {label}
                        {props.required && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    ref={ref}
                    className={cn(
                        "flex w-full rounded-xl border bg-white px-3 py-2.5 text-xs text-slate-800 transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error ? "border-rose-400 focus:ring-rose-400" : "border-slate-200",
                        className
                    )}
                    {...props}
                />
                {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
                {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

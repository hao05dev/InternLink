import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options?: Array<{ label: string; value: string | number }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, hint, id, children, options, ...props }, ref) => {
        const generatedId = React.useId();
        const selectId = id || generatedId;

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
                        {label}
                        {props.required && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <select
                        id={selectId}
                        ref={ref}
                        className={cn(
                            "flex h-10 w-full rounded-xl border bg-white px-3 py-2 text-xs text-slate-800 transition-colors cursor-pointer",
                            "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            error ? "border-rose-400 focus:ring-rose-400" : "border-slate-200",
                            className
                        )}
                        {...props}
                    >
                        {options
                            ? options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                  </option>
                              ))
                            : children}
                    </select>
                </div>
                {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
                {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
            </div>
        );
    }
);
Select.displayName = "Select";

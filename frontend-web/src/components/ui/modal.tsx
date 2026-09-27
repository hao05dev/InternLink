"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
    className?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = "lg",
    className,
}: ModalProps) {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "4xl": "max-w-4xl",
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="fixed inset-0" 
                onClick={onClose} 
                aria-hidden="true" 
            />

            <div
                className={cn(
                    "relative w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col",
                    maxWidthClasses[maxWidth],
                    className
                )}
            >
                {(title || description) && (
                    <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
                        <div>
                            {title && <h3 className="text-base font-bold text-slate-900 leading-snug">{title}</h3>}
                            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            aria-label="Đóng hộp thoại"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="overflow-y-auto flex-1 pr-1 -mr-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, LucideIcon } from "lucide-react";

export interface CustomSelectOption {
    label: string;
    value: string;
    group?: string;
}

interface CustomFilterSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: CustomSelectOption[];
    icon?: LucideIcon;
    placeholder?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    className?: string;
}

export function CustomFilterSelect({
    value,
    onChange,
    options,
    icon: Icon,
    placeholder = "Chọn giá trị",
    searchable = false,
    searchPlaceholder = "Tìm kiếm...",
    className = ""
}: CustomFilterSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = searchable && searchQuery.trim()
        ? options.filter((opt) =>
              opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (opt.group && opt.group.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : options;

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setSearchQuery("");
    };

    return (
        <div ref={dropdownRef} className={`relative w-full ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isOpen
                        ? "bg-white border-sky-500 ring-2 ring-sky-500/20 text-slate-900 shadow-sm"
                        : "bg-slate-50/80 hover:bg-white border-slate-200 text-slate-800 hover:border-slate-300"
                }`}
            >
                <div className="flex items-center gap-2 truncate min-w-0">
                    {Icon && <Icon className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-sky-600" : ""
                    }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden py-1.5 animate-in fade-in-0 zoom-in-95 duration-150">
                    {searchable && (
                        <div className="px-2.5 pb-2 pt-1 border-b border-slate-100">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-h-56 overflow-y-auto px-1 space-y-0.5">
                        {filteredOptions.length === 0 ? (
                            <div className="py-3 text-center text-xs text-slate-400">
                                Không tìm thấy kết quả
                            </div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = opt.value === value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                                            isSelected
                                                ? "bg-sky-50 text-sky-800 font-bold"
                                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <span className="truncate">
                                            {opt.label} {opt.group && opt.group !== "Toàn quốc" ? `(${opt.group})` : ""}
                                        </span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

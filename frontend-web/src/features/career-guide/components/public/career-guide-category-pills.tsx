"use client";

import { PostCategory, POST_CATEGORY_LABELS } from "../../types/post.types";

interface CategoryOption {
    key: string;
    label: string;
    count?: number;
}

interface CareerGuideCategoryPillsProps {
    selectedCategory: string;
    onSelectCategory: (cat: string) => void;
    categoryCounts?: Record<string, number>;
}

export function CareerGuideCategoryPills({
    selectedCategory,
    onSelectCategory,
    categoryCounts = {},
}: CareerGuideCategoryPillsProps) {
    const categories: CategoryOption[] = [
        { key: "ALL", label: "Tất cả chủ đề", count: categoryCounts["ALL"] },
        ...Object.entries(POST_CATEGORY_LABELS).map(([catKey, val]) => ({
            key: catKey,
            label: val.label,
            count: categoryCounts[catKey],
        })),
    ];

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 pb-1">
            {categories.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                    <button
                        key={cat.key}
                        type="button"
                        onClick={() => onSelectCategory(cat.key)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer ${
                            isSelected
                                ? "bg-slate-900 dark:bg-sky-600 text-white shadow-xs font-semibold ring-2 ring-slate-900/10 dark:ring-sky-500/20"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                        }`}
                    >
                        <span>{cat.label}</span>
                        {typeof cat.count === "number" && cat.count > 0 && (
                            <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                    isSelected
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                }`}
                            >
                                {cat.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

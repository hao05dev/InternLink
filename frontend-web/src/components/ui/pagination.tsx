"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    pageSize?: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    className?: string;
    showPageSizeSelect?: boolean;
    showQuickJump?: boolean;
    itemLabel?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    onPageChange,
    onPageSizeChange,
    className,
    showPageSizeSelect = true,
    showQuickJump = false,
    itemLabel = "bản ghi",
}: PaginationProps) {
    const [jumpPage, setJumpPage] = useState("");

    if (totalPages <= 0 && (!totalItems || totalItems === 0)) {
        return null;
    }

    const safeTotalPages = Math.max(1, totalPages);
    const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

    // Calculate display range
    const startItem = totalItems !== undefined ? (safeCurrentPage - 1) * pageSize + 1 : undefined;
    const endItem = totalItems !== undefined ? Math.min(safeCurrentPage * pageSize, totalItems) : undefined;

    // Generate page numbers to show with ellipsis
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const delta = 1; // Number of pages before and after current

        for (let i = 1; i <= safeTotalPages; i++) {
            if (
                i === 1 ||
                i === safeTotalPages ||
                (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)
            ) {
                pages.push(i);
            } else if (
                (i === safeCurrentPage - delta - 1 && i > 1) ||
                (i === safeCurrentPage + delta + 1 && i < safeTotalPages)
            ) {
                pages.push("...");
            }
        }

        // Deduplicate consecutive ellipses
        return pages.filter((item, idx, arr) => {
            if (item === "..." && arr[idx - 1] === "...") return false;
            return true;
        });
    };

    const handleJumpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pageNum = parseInt(jumpPage, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= safeTotalPages) {
            onPageChange(pageNum);
            setJumpPage("");
        }
    };

    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 text-xs text-slate-600 select-none",
                className
            )}
        >
            {/* Left: Summary and Page Size Selector */}
            <div className="flex items-center flex-wrap gap-3">
                {totalItems !== undefined && (
                    <span className="font-medium text-slate-700">
                        Hiển thị <span className="font-bold text-slate-900">{totalItems > 0 ? startItem : 0}</span> -{" "}
                        <span className="font-bold text-slate-900">{endItem}</span> trên{" "}
                        <span className="font-bold text-slate-900">{totalItems}</span> {itemLabel}
                    </span>
                )}

                {showPageSizeSelect && onPageSizeChange && (
                    <div className="flex items-center gap-1.5 ml-1">
                        <span className="text-slate-500">Mỗi trang:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                            aria-label="Chọn số bản ghi mỗi trang"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Right: Navigation Controls */}
            <div className="flex items-center gap-1 flex-wrap">
                {/* First Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(1)}
                    disabled={safeCurrentPage <= 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                    title="Đầu trang"
                    aria-label="Trang đầu"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </button>

                {/* Prev Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage <= 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                    title="Trang trước"
                    aria-label="Trang trước"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((p, idx) => {
                        if (p === "...") {
                            return (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="px-1.5 text-slate-400 font-medium"
                                >
                                    ...
                                </span>
                            );
                        }

                        const pageNum = p as number;
                        const isActive = pageNum === safeCurrentPage;

                        return (
                            <button
                                key={pageNum}
                                type="button"
                                onClick={() => onPageChange(pageNum)}
                                className={cn(
                                    "inline-flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-semibold transition-all shadow-2xs",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-blue-600/20 shadow-sm"
                                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
                                )}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                {/* Next Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage >= safeTotalPages}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                    title="Trang sau"
                    aria-label="Trang sau"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>

                {/* Last Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(safeTotalPages)}
                    disabled={safeCurrentPage >= safeTotalPages}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                    title="Cuối trang"
                    aria-label="Trang cuối"
                >
                    <ChevronsRight className="h-4 w-4" />
                </button>

                {/* Quick Jump Input */}
                {showQuickJump && safeTotalPages > 3 && (
                    <form onSubmit={handleJumpSubmit} className="flex items-center gap-1 ml-2">
                        <span className="text-slate-400">Đến:</span>
                        <input
                            type="number"
                            min={1}
                            max={safeTotalPages}
                            value={jumpPage}
                            onChange={(e) => setJumpPage(e.target.value)}
                            placeholder={`${safeCurrentPage}`}
                            className="h-8 w-12 rounded-lg border border-slate-200 bg-white px-1.5 text-center text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                    </form>
                )}
            </div>
        </div>
    );
}

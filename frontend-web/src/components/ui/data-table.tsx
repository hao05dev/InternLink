"use client";

import React, { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination, PaginationProps } from "@/components/ui/pagination";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
    sortable?: boolean;
    align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: React.ReactNode;
    keyExtractor: (item: T) => string;
    className?: string;
    
    // Density mode
    density?: "comfortable" | "compact";
    
    // Search Toolbar
    searchable?: boolean;
    searchPlaceholder?: string;
    searchFields?: (keyof T)[];
    
    // Custom Toolbar action buttons / filters
    toolbarActions?: React.ReactNode;
    
    // Selection
    selectable?: boolean;
    selectedKeys?: Set<string>;
    onSelectionChange?: (selectedKeys: Set<string>) => void;
    batchActions?: (selectedKeys: Set<string>, clearSelection: () => void) => React.ReactNode;
    
    // Pagination
    pagination?: Omit<PaginationProps, "className">;
    
    // Sticky Header
    stickyHeader?: boolean;
}

export function DataTable<T>({
    columns,
    data,
    isLoading = false,
    emptyTitle = "Chưa có dữ liệu",
    emptyDescription = "Hiện tại chưa có bản ghi nào để hiển thị trong mục này.",
    emptyAction,
    keyExtractor,
    className,
    density = "comfortable",
    searchable = false,
    searchPlaceholder = "Tìm kiếm nhanh...",
    searchFields,
    toolbarActions,
    selectable = false,
    selectedKeys,
    onSelectionChange,
    batchActions,
    pagination,
    stickyHeader = false,
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [currentDensity, setCurrentDensity] = useState<"comfortable" | "compact">(density);

    // Filter by search term if searchable enabled and searchFields provided
    const filteredData = useMemo(() => {
        if (!searchable || !searchTerm.trim() || !searchFields || searchFields.length === 0) {
            return data;
        }

        const query = searchTerm.toLowerCase().trim();
        return data.filter((item) => {
            return searchFields.some((field) => {
                const val = item[field];
                if (val === null || val === undefined) return false;
                return String(val).toLowerCase().includes(query);
            });
        });
    }, [data, searchable, searchTerm, searchFields]);

    // Client-side Sort
    const sortedData = useMemo(() => {
        if (!sortColumn) return filteredData;

        return [...filteredData].sort((a, b) => {
            const valA = a[sortColumn];
            const valB = b[sortColumn];

            if (valA === valB) return 0;
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;

            if (typeof valA === "number" && typeof valB === "number") {
                return sortDirection === "asc" ? valA - valB : valB - valA;
            }

            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();

            return sortDirection === "asc"
                ? strA.localeCompare(strB, "vi")
                : strB.localeCompare(strA, "vi");
        });
    }, [filteredData, sortColumn, sortDirection]);

    const handleSort = (col: Column<T>) => {
        if (!col.sortable || !col.accessorKey) return;

        if (sortColumn === col.accessorKey) {
            if (sortDirection === "asc") {
                setSortDirection("desc");
            } else {
                setSortColumn(null);
                setSortDirection("asc");
            }
        } else {
            setSortColumn(col.accessorKey);
            setSortDirection("asc");
        }
    };

    // Selection handlers
    const allKeys = useMemo(() => sortedData.map(keyExtractor), [sortedData, keyExtractor]);
    const isAllSelected = selectedKeys && allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k));
    const isPartiallySelected =
        selectedKeys && selectedKeys.size > 0 && !isAllSelected && allKeys.some((k) => selectedKeys.has(k));

    const handleSelectAll = () => {
        if (!onSelectionChange) return;
        if (isAllSelected) {
            onSelectionChange(new Set());
        } else {
            onSelectionChange(new Set(allKeys));
        }
    };

    const handleSelectRow = (key: string) => {
        if (!onSelectionChange || !selectedKeys) return;
        const next = new Set(selectedKeys);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        onSelectionChange(next);
    };

    const clearSelection = () => {
        if (onSelectionChange) {
            onSelectionChange(new Set());
        }
    };

    const rowPaddingClass =
        currentDensity === "compact" ? "px-3 py-2 text-xs" : "px-4 py-3.5 text-xs sm:text-[13px]";

    if (isLoading) {
        return (
            <div className="w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <div className="p-4 space-y-3">
                    <Skeleton className="h-9 w-full rounded-lg" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn("w-full space-y-3", className)}>
            {/* Toolbar: Search, Filters, Density Switcher, Batch Actions */}
            {(searchable || toolbarActions || (selectable && selectedKeys && selectedKeys.size > 0)) && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    {/* Left: Search input */}
                    {searchable ? (
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    ) : (
                        <div />
                    )}

                    {/* Batch Actions Bar when items selected */}
                    {selectable && selectedKeys && selectedKeys.size > 0 && batchActions && (
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 text-xs text-blue-900 font-medium animate-in fade-in duration-200">
                            <span>Đã chọn <strong className="font-bold">{selectedKeys.size}</strong> mục</span>
                            <div className="h-4 w-px bg-blue-200 mx-1" />
                            {batchActions(selectedKeys, clearSelection)}
                        </div>
                    )}

                    {/* Right: Actions and Density Switch */}
                    <div className="flex items-center gap-2 ml-auto">
                        {toolbarActions}
                        <button
                            type="button"
                            onClick={() => setCurrentDensity(currentDensity === "comfortable" ? "compact" : "comfortable")}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
                            title={`Chế độ hiển thị: ${currentDensity === "comfortable" ? "Thoáng" : "Thu gọn"}`}
                        >
                            <Layers className="h-3.5 w-3.5 text-slate-500" />
                            <span className="hidden md:inline">{currentDensity === "comfortable" ? "Gọn" : "Thoáng"}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Table Container */}
            {sortedData.length === 0 ? (
                <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                />
            ) : (
                <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-left border-collapse">
                            <thead className={cn(stickyHeader && "sticky top-0 z-10 bg-slate-50 shadow-2xs")}>
                                <tr className="border-b border-slate-200/80 bg-slate-50/90">
                                    {selectable && (
                                        <th scope="col" className="w-10 px-3 py-3 text-center align-middle">
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                ref={(el) => {
                                                    if (el) el.indeterminate = Boolean(isPartiallySelected);
                                                }}
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                                                aria-label="Chọn tất cả các dòng"
                                            />
                                        </th>
                                    )}
                                    {columns.map((col, idx) => {
                                        const isSorted = sortColumn === col.accessorKey;
                                        const alignClass =
                                            col.align === "center"
                                                ? "text-center"
                                                : col.align === "right"
                                                ? "text-right"
                                                : "text-left";

                                        return (
                                            <th
                                                key={idx}
                                                scope="col"
                                                onClick={() => handleSort(col)}
                                                className={cn(
                                                    "py-3 font-bold uppercase tracking-wider text-slate-700 text-[11px] whitespace-nowrap select-none",
                                                    currentDensity === "compact" ? "px-3" : "px-4",
                                                    col.sortable && "cursor-pointer hover:bg-slate-100/80 transition-colors",
                                                    alignClass,
                                                    col.className
                                                )}
                                            >
                                                <div className={cn("inline-flex items-center gap-1.5", alignClass === "text-right" && "justify-end", alignClass === "text-center" && "justify-center")}>
                                                    <span>{col.header}</span>
                                                    {col.sortable && (
                                                        <span className="text-slate-400">
                                                            {isSorted ? (
                                                                sortDirection === "asc" ? (
                                                                    <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
                                                                ) : (
                                                                    <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
                                                                )
                                                            ) : (
                                                                <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedData.map((item) => {
                                    const key = keyExtractor(item);
                                    const isRowSelected = selectedKeys?.has(key);

                                    return (
                                        <tr
                                            key={key}
                                            className={cn(
                                                "transition-colors group",
                                                isRowSelected ? "bg-blue-50/50 hover:bg-blue-50/80" : "hover:bg-sky-50/40"
                                            )}
                                        >
                                            {selectable && (
                                                <td className="w-10 px-3 py-2 text-center align-middle">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(isRowSelected)}
                                                        onChange={() => handleSelectRow(key)}
                                                        className="h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                                                        aria-label={`Chọn dòng ${key}`}
                                                    />
                                                </td>
                                            )}
                                            {columns.map((col, colIdx) => {
                                                const alignClass =
                                                    col.align === "center"
                                                        ? "text-center"
                                                        : col.align === "right"
                                                        ? "text-right"
                                                        : "text-left";

                                                return (
                                                    <td
                                                        key={colIdx}
                                                        className={cn(
                                                            rowPaddingClass,
                                                            "text-slate-700 align-middle",
                                                            alignClass,
                                                            col.className
                                                        )}
                                                    >
                                                        {col.cell
                                                            ? col.cell(item)
                                                            : col.accessorKey
                                                            ? String(item[col.accessorKey] ?? "")
                                                            : null}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Integrated Pagination if provided */}
                    {pagination && (
                        <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-1">
                            <Pagination {...pagination} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

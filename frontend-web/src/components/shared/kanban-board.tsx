"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { GripVertical, MoreHorizontal, User, Mail, Building, Clock, ChevronRight } from "lucide-react";

export interface KanbanStage {
    id: string;
    label: string;
    description?: string;
    color?: string; // e.g. "blue", "amber", "emerald", "purple", "rose"
    badgeCount?: number;
}

export interface KanbanItem {
    id: string;
    stageId: string;
    title: string;
    subtitle?: string;
    avatarUrl?: string;
    tags?: string[];
    metadata?: {
        label: string;
        value: string | number;
    }[];
    updatedAt?: string;
    raw?: any;
}

export interface KanbanBoardProps<T extends KanbanItem = KanbanItem> {
    stages: KanbanStage[];
    items: T[];
    onItemMove: (itemId: string, targetStageId: string) => void | Promise<void>;
    renderCustomCard?: (item: T, isDragging: boolean) => React.ReactNode;
    onItemClick?: (item: T) => void;
    isLoading?: boolean;
    className?: string;
}

const STAGE_THEMES: Record<string, { bg: string; border: string; badgeBg: string; text: string; dot: string }> = {
    blue: {
        bg: "bg-blue-50/40",
        border: "border-blue-200/80",
        badgeBg: "bg-blue-100 text-blue-800",
        text: "text-blue-900",
        dot: "bg-blue-500",
    },
    amber: {
        bg: "bg-amber-50/40",
        border: "border-amber-200/80",
        badgeBg: "bg-amber-100 text-amber-800",
        text: "text-amber-900",
        dot: "bg-amber-500",
    },
    purple: {
        bg: "bg-purple-50/40",
        border: "border-purple-200/80",
        badgeBg: "bg-purple-100 text-purple-800",
        text: "text-purple-900",
        dot: "bg-purple-500",
    },
    emerald: {
        bg: "bg-emerald-50/40",
        border: "border-emerald-200/80",
        badgeBg: "bg-emerald-100 text-emerald-800",
        text: "text-emerald-900",
        dot: "bg-emerald-500",
    },
    rose: {
        bg: "bg-rose-50/40",
        border: "border-rose-200/80",
        badgeBg: "bg-rose-100 text-rose-800",
        text: "text-rose-900",
        dot: "bg-rose-500",
    },
    slate: {
        bg: "bg-slate-50/60",
        border: "border-slate-200/80",
        badgeBg: "bg-slate-200/70 text-slate-700",
        text: "text-slate-800",
        dot: "bg-slate-400",
    },
};

export function KanbanBoard<T extends KanbanItem = KanbanItem>({
    stages,
    items,
    onItemMove,
    renderCustomCard,
    onItemClick,
    isLoading = false,
    className,
}: KanbanBoardProps<T>) {
    const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
    const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, item: T) => {
        setDraggingItemId(item.id);
        e.dataTransfer.setData("text/plain", item.id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = () => {
        setDraggingItemId(null);
        setDragOverStageId(null);
    };

    const handleDragOver = (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        if (dragOverStageId !== stageId) {
            setDragOverStageId(stageId);
        }
    };

    const handleDragLeave = (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        e.stopPropagation();
        // Only clear if actually leaving the column container
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        if (dragOverStageId === stageId) {
            setDragOverStageId(null);
        }
    };

    const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverStageId(null);

        const itemId = e.dataTransfer.getData("text/plain") || draggingItemId;
        if (!itemId) return;

        const currentItem = items.find((i) => i.id === itemId);
        if (currentItem && currentItem.stageId !== targetStageId) {
            await onItemMove(itemId, targetStageId);
        }
        setDraggingItemId(null);
    };

    return (
        <div className={cn("w-full overflow-x-auto pb-4", className)}>
            <div className="flex items-start gap-4 min-w-[1000px] select-none">
                {stages.map((stage) => {
                    const stageItems = items.filter((item) => item.stageId === stage.id);
                    const theme = STAGE_THEMES[stage.color || "slate"] || STAGE_THEMES.slate;
                    const isColumnOver = dragOverStageId === stage.id;

                    return (
                        <div
                            key={stage.id}
                            onDragOver={(e) => handleDragOver(e, stage.id)}
                            onDragLeave={(e) => handleDragLeave(e, stage.id)}
                            onDrop={(e) => handleDrop(e, stage.id)}
                            className={cn(
                                "flex-1 min-w-[280px] max-w-[340px] rounded-2xl border bg-slate-50/50 p-3 flex flex-col transition-all duration-200",
                                isColumnOver
                                    ? "ring-2 ring-blue-500/50 bg-blue-50/30 border-blue-300 shadow-md scale-[1.01]"
                                    : "border-slate-200/80 shadow-2xs"
                            )}
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between gap-2 px-1 py-1.5 mb-3 border-b border-slate-200/60 pb-2.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", theme.dot)} />
                                    <h3 className="font-bold text-xs text-slate-800 truncate" title={stage.label}>
                                        {stage.label}
                                    </h3>
                                </div>
                                <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0", theme.badgeBg)}>
                                    {stageItems.length}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 space-y-2.5 min-h-[220px] max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                                {stageItems.map((item) => {
                                    const isDragging = draggingItemId === item.id;

                                    if (renderCustomCard) {
                                        return (
                                            <div
                                                key={item.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, item)}
                                                onDragEnd={handleDragEnd}
                                                onClick={() => onItemClick?.(item)}
                                                className={cn(
                                                    "cursor-grab active:cursor-grabbing transition-all",
                                                    isDragging && "opacity-40 scale-95"
                                                )}
                                            >
                                                {renderCustomCard(item, isDragging)}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={item.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => onItemClick?.(item)}
                                            className={cn(
                                                "group relative rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing",
                                                isDragging && "opacity-40 scale-95 border-blue-400 rotate-1 shadow-lg"
                                            )}
                                        >
                                            {/* Grip handle and title */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                        {item.title}
                                                    </h4>
                                                    {item.subtitle && (
                                                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                            {item.subtitle}
                                                        </p>
                                                    )}
                                                </div>
                                                <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
                                            </div>

                                            {/* Tags */}
                                            {item.tags && item.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2.5">
                                                    {item.tags.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Metadata */}
                                            {item.metadata && item.metadata.length > 0 && (
                                                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                                    {item.metadata.map((meta, idx) => (
                                                        <div key={idx} className="truncate">
                                                            <span className="text-slate-400 mr-1">{meta.label}:</span>
                                                            <span className="font-semibold text-slate-700">{meta.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {stageItems.length === 0 && (
                                    <div className="h-full min-h-[140px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200/80 rounded-xl p-4 text-center">
                                        <p className="text-[11px] text-slate-400 font-medium">
                                            Kéo thẻ thả vào đây
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Bell,
    CheckCheck,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
    Briefcase,
    GraduationCap,
    Building2,
    BookOpen,
    Award,
    FileText,
    MessageSquare,
    RotateCw,
    ExternalLink,
    Clock,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { notificationService } from '@/features/notifications/services/notification.service';
import type { Notification } from '@/features/notifications/types/notification.types';
import { cn } from '@/lib/utils';

function formatTimeAgo(isoString: string): string {
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;

        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return '';
    }
}

function getNotificationVisuals(type: string) {
    switch (type) {
        case 'INTRODUCTION_LETTER_PICKUP':
            return {
                icon: FileText,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
            };
        case 'COMPANY_FORM_REMINDER':
            return {
                icon: Building2,
                color: 'text-amber-600 bg-amber-50 border-amber-200',
            };
        case 'STUDENT_FOUND_SUBMITTED':
            return {
                icon: FileText,
                color: 'text-sky-600 bg-sky-50 border-sky-200',
            };
        case 'STUDENT_FOUND_APPROVED':
        case 'JOB_APPROVED':
        case 'LOGBOOK_APPROVED':
        case 'OFFER_ACCEPTED':
            return {
                icon: CheckCircle2,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
            };
        case 'STUDENT_FOUND_REVISION':
        case 'LOGBOOK_REVISION_REQUESTED':
            return {
                icon: AlertTriangle,
                color: 'text-amber-600 bg-amber-50 border-amber-200',
            };
        case 'STUDENT_FOUND_REJECTED':
        case 'JOB_REJECTED':
        case 'OFFER_REJECTED':
            return {
                icon: XCircle,
                color: 'text-rose-600 bg-rose-50 border-rose-200',
            };
        case 'LECTURER_ASSIGNED':
            return {
                icon: GraduationCap,
                color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
            };
        case 'LOGBOOK_SUBMITTED':
            return {
                icon: BookOpen,
                color: 'text-sky-600 bg-sky-50 border-sky-200',
            };
        case 'LOGBOOK_COMMENTED':
            return {
                icon: MessageSquare,
                color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
            };
        case 'NEW_JOB_POSTED':
        case 'OFFER_SENT':
            return {
                icon: Briefcase,
                color: 'text-sky-600 bg-sky-50 border-sky-200',
            };
        case 'FINAL_RESULT_PUBLISHED':
            return {
                icon: Award,
                color: 'text-purple-600 bg-purple-50 border-purple-200',
            };
        default:
            return {
                icon: Info,
                color: 'text-slate-600 bg-slate-100 border-slate-200',
            };
    }
}

function resolveActionUrl(url?: string, role?: string, type?: string): string | null {
    if (url && url.startsWith('/')) {
        // Nếu là thỏa thuận và là sinh viên, chuyển hướng về portal thỏa thuận học tập sinh viên
        if (role === 'STUDENT' && url.startsWith('/agreements/')) {
            return '/student/learning-agreement';
        }
        return url;
    }

    // Fallback theo role và type nếu actionUrl trống
    if (!type || !role) return null;

    if (role === 'STUDENT') {
        if (type.startsWith('LOGBOOK_')) return '/student/weekly-logs';
        if (type.startsWith('STUDENT_FOUND_') || type.startsWith('COMPANY_FORM_') || type.startsWith('OFFER_'))
            return '/student/applications';
        if (type === 'FINAL_RESULT_PUBLISHED') return '/student/final-report';
        if (type === 'INTRODUCTION_LETTER_PICKUP') return '/student/dashboard';
        if (type === 'NEW_JOB_POSTED') return '/jobs';
    } else if (role === 'LECTURER') {
        if (type.startsWith('LOGBOOK_') || type === 'LECTURER_ASSIGNED') return '/lecturer/supervision';
    } else if (role === 'COMPANY_MENTOR') {
        if (type.startsWith('LOGBOOK_')) return '/mentor/weekly-evaluations';
    } else if (role === 'FACULTY_ADMIN') {
        if (type.startsWith('STUDENT_FOUND_') || type.startsWith('JOB_')) return '/faculty/job-approvals';
    } else if (role === 'COMPANY_REP') {
        if (type.startsWith('JOB_')) return '/company/jobs';
        if (type.startsWith('OFFER_')) return '/company/candidates';
    }

    return null;
}

export function NotificationCenter() {
    const { user, isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [markingAll, setMarkingAll] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const loadNotifications = useCallback(async () => {
        if (!isAuthenticated || !user) return;
        setLoading(true);
        try {
            const res = await notificationService.getMyNotifications();
            setItems(res.data ?? []);
        } catch {
            // Không làm phiền người dùng nếu lỗi ngầm
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        loadNotifications();
        // Polling nhẹ mỗi 45 giây để cập nhật thông báo mới
        const timer = setInterval(() => {
            loadNotifications();
        }, 45000);
        return () => clearInterval(timer);
    }, [loadNotifications]);

    // Click outside listener
    useEffect(() => {
        function handleClickOutside(event: MouseEvent | TouchEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') setOpen(false);
        }

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            await notificationService.markRead(id);
            setItems(current =>
                current.map(item => (item.id === id ? { ...item, isRead: true } : item))
            );
        } catch {
            // ignore
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        try {
            await notificationService.markAllRead();
            setItems(current => current.map(item => ({ ...item, isRead: true })));
        } catch {
            // ignore
        } finally {
            setMarkingAll(false);
        }
    };

    const unreadCount = items.filter(item => !item.isRead).length;
    const displayedItems = filter === 'unread' ? items.filter(item => !item.isRead) : items;

    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={containerRef}>
            {/* Bell Trigger */}
            <button
                type="button"
                onClick={() => {
                    if (!open) loadNotifications();
                    setOpen(prev => !prev)}
                }
                aria-expanded={open}
                aria-label={`Thông báo hệ thống, ${unreadCount} chưa đọc`}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-bold text-white bg-rose-600 rounded-full shadow-xs animate-in zoom-in-75">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Popover */}
            {open && (
                <div className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">Thông báo</span>
                            {unreadCount > 0 && (
                                <span className="bg-rose-100 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount} mới
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={loadNotifications}
                                title="Làm mới"
                                disabled={loading}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
                            >
                                <RotateCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                            </button>

                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllRead}
                                    disabled={markingAll}
                                    title="Đánh dấu tất cả đã đọc"
                                    className="flex items-center gap-1 px-2 py-1 text-xs text-sky-700 hover:text-sky-800 hover:bg-sky-50 font-medium rounded-lg transition disabled:opacity-50"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Đã đọc hết</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex border-b border-slate-100 bg-white px-3 pt-2 gap-2 text-xs">
                        <button
                            type="button"
                            onClick={() => setFilter('all')}
                            className={cn(
                                "pb-2 px-2.5 font-semibold transition border-b-2 -mb-px",
                                filter === 'all'
                                    ? "text-sky-700 border-sky-600 font-bold"
                                    : "text-slate-500 border-transparent hover:text-slate-800"
                            )}
                        >
                            Tất cả ({items.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter('unread')}
                            className={cn(
                                "pb-2 px-2.5 font-semibold transition border-b-2 -mb-px",
                                filter === 'unread'
                                    ? "text-sky-700 border-sky-600 font-bold"
                                    : "text-slate-500 border-transparent hover:text-slate-800"
                            )}
                        >
                            Chưa đọc ({unreadCount})
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[22rem] overflow-y-auto divide-y divide-slate-100">
                        {displayedItems.length === 0 ? (
                            <div className="py-10 px-4 text-center">
                                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold text-slate-700">
                                    {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Các thông tin hoạt động, phê duyệt và nhắc nhở sẽ hiển thị tại đây.
                                </p>
                            </div>
                        ) : (
                            displayedItems.map(item => {
                                const { icon: VisualIcon, color: visualColor } = getNotificationVisuals(item.notificationType);
                                const targetUrl = resolveActionUrl(item.actionUrl, user?.role, item.notificationType);

                                return (
                                    <Link
                                        key={item.id}
                                        href={targetUrl || '#'}
                                        onClick={(e) => {
                                            if (!targetUrl) {
                                                e.preventDefault();
                                            }
                                            if (!item.isRead) {
                                                handleMarkAsRead(item.id);
                                            }
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "p-3.5 flex gap-3 transition-colors text-left group hover:bg-slate-50 relative",
                                            !item.isRead ? "bg-sky-50/40" : "bg-white"
                                        )}
                                    >
                                        {/* Icon */}
                                        <div
                                            className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5",
                                                visualColor
                                            )}
                                        >
                                            <VisualIcon className="w-4 h-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-1.5">
                                                <h4
                                                    className={cn(
                                                        "text-xs leading-snug line-clamp-1",
                                                        !item.isRead
                                                            ? "font-bold text-slate-900"
                                                            : "font-semibold text-slate-700"
                                                    )}
                                                >
                                                    {item.title}
                                                </h4>
                                                {!item.isRead && (
                                                    <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0 mt-1" />
                                                )}
                                            </div>

                                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                                {item.message}
                                            </p>

                                            <div className="flex items-center justify-between gap-2 mt-2 pt-1">
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatTimeAgo(item.createdAt)}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {targetUrl && (
                                                        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-sky-700 group-hover:underline">
                                                            Chi tiết
                                                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                                                        </span>
                                                    )}

                                                    {!item.isRead && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleMarkAsRead(item.id, e)}
                                                            title="Đánh dấu đã đọc"
                                                            className="text-[10px] text-slate-400 hover:text-sky-700 p-0.5 rounded transition"
                                                        >
                                                            Đã đọc
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

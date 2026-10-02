'use client';

import React from 'react';
import { ClipboardCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFacultyInternship } from '../hooks/use-faculty-internship';
import { InternshipProgressGuide } from './internship-progress-guide';
import { InternshipStatsBar } from './internship-stats-bar';
import { InternshipFilterToolbar } from './internship-filter-toolbar';
import { InternshipManagementTable } from './internship-management-table';
import { ConfirmCompanyAcceptanceModal } from './modals/confirm-company-acceptance-modal';

export default function FacultyInternshipManagementView() {
    const {
        terms,
        selectedTermId,
        selectedTerm,
        isLoading,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        message,
        setMessage,
        rows,
        filteredRows,
        stats,
        confirmModal,
        reviewNote,
        setReviewNote,
        isProcessing,
        handleTermChange,
        toggleLetterReceived,
        openConfirmModal,
        closeConfirmModal,
        handleApproveFoundApp,
    } = useFacultyInternship();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <ClipboardCheck className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Quản Lý Tiến Trình Thực Tập</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Theo dõi và xác nhận từng bước thực tập của sinh viên trong kỳ
                        </p>
                    </div>
                </div>
            </div>

            {/* Notification alert */}
            {message && (
                <div
                    role="alert"
                    aria-live="polite"
                    className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                        <span>{message.text}</span>
                    </div>
                    <button
                        onClick={() => setMessage(null)}
                        className="text-slate-400 hover:text-slate-600 ml-4 text-lg leading-none cursor-pointer"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Process explanation banner */}
            <InternshipProgressGuide />

            {selectedTerm?.status === 'CLOSED' && (
                <div className="p-4 rounded-xl flex items-center gap-3 text-sm font-medium bg-amber-50 text-amber-900 border border-amber-200 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Học kỳ này đã kết thúc (CLOSED). Toàn bộ dữ liệu ở chế độ chỉ xem, không thể xác nhận tiến trình hoặc xét duyệt đơn của sinh viên.</span>
                </div>
            )}

            {/* Term selector and Stats */}
            <InternshipStatsBar
                terms={terms}
                selectedTermId={selectedTermId}
                selectedTerm={selectedTerm}
                onTermChange={handleTermChange}
                stats={stats}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
            />

            {/* Filter toolbar */}
            <InternshipFilterToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
            />

            {/* Student management table */}
            <InternshipManagementTable
                isLoading={isLoading}
                rows={rows}
                filteredRows={filteredRows}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                isTermClosed={selectedTerm?.status === 'CLOSED'}
                onToggleLetterReceived={toggleLetterReceived}
                onOpenConfirmModal={openConfirmModal}
            />

            {/* Modal */}
            <ConfirmCompanyAcceptanceModal
                isOpen={confirmModal.open}
                studentName={confirmModal.studentName}
                hostName={confirmModal.hostName}
                reviewNote={reviewNote}
                onReviewNoteChange={setReviewNote}
                isProcessing={isProcessing}
                onClose={closeConfirmModal}
                onConfirm={handleApproveFoundApp}
            />
        </div>
    );
}

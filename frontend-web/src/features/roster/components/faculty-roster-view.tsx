'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AcademicTermFilter } from '@/components/ui/academic-term-filter';
import {
    Users,
    Upload,
    CheckCircle2,
    FileSpreadsheet,
    AlertCircle,
    Mail,
    BookOpen,
    UserPlus,
    AlertTriangle,
} from 'lucide-react';
import { useFacultyRoster } from '../hooks/use-faculty-roster';
import { RosterStatsCards } from './roster-stats-cards';
import { RosterFilterBar } from './roster-filter-bar';
import { RosterTable } from './roster-table';
import { ExcelImportModal } from './modals/excel-import-modal';
import { ManualAddStudentModal } from './modals/manual-add-student-modal';
import { EmailNotificationModal } from './modals/email-notification-modal';
import { IneligibleNotificationModal } from './modals/ineligible-notification-modal';
import { BatchProvisionModal } from './modals/batch-provision-modal';
import { ProvisionAccountModal } from './modals/provision-account-modal';
import { ProvisionResultModal } from './modals/provision-result-modal';

export default function FacultyRosterView() {
    const {
        roster,
        filtered,
        terms,
        selectedTermId,
        selectedTerm,
        programs,
        isLoading,
        isActionLoading,
        searchTerm,
        setSearchTerm,
        filterProgram,
        setFilterProgram,
        message,
        setMessage,
        stats,
        // Modals
        isImportModalOpen,
        setIsImportModalOpen,
        isExcelModalOpen,
        setIsExcelModalOpen,
        isEmailModalOpen,
        setIsEmailModalOpen,
        isBatchProvisionModalOpen,
        setIsBatchProvisionModalOpen,
        isIneligibleEmailModalOpen,
        setIsIneligibleEmailModalOpen,
        // Provision
        provisionTarget,
        setProvisionTarget,
        provisionResult,
        setProvisionResult,
        // Handlers
        handleTermChange,
        handleProvisionAccount,
        handleBatchProvision,
        handleNotifyIneligible,
        handleManualAdd,
        handleExcelImport,
        handleNotifyPickup,
    } = useFacultyRoster();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-sky-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Danh Sách Sinh Viên Đăng Ký Thực Tập</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Quản lý danh sách sinh viên đủ điều kiện tham gia kỳ thực tập
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="secondary"
                        onClick={() => setIsExcelModalOpen(true)}
                        disabled={selectedTerm?.status === 'CLOSED'}
                        className="gap-2 text-sm"
                        title={selectedTerm?.status === 'CLOSED' ? 'Học kỳ đã kết thúc, không thể import' : undefined}
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        Import Excel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setIsImportModalOpen(true)}
                        disabled={selectedTerm?.status === 'CLOSED'}
                        className="gap-2 text-sm"
                        title={selectedTerm?.status === 'CLOSED' ? 'Học kỳ đã kết thúc, không thể thêm sinh viên' : undefined}
                    >
                        <Upload className="w-4 h-4" />
                        Thêm sinh viên
                    </Button>
                </div>
            </div>

            {/* Closed Semester Alert Banner */}
            {selectedTerm?.status === 'CLOSED' && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3 text-amber-900 shadow-xs">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                        <p className="font-bold">Học kỳ này đã kết thúc (CLOSED)</p>
                        <p className="text-amber-800 text-xs mt-0.5">
                            Dữ liệu của học kỳ đang ở chế độ <strong>Chỉ đọc (Read-only)</strong>. Mọi hoạt động thêm sinh viên, cấp tài khoản và gửi email thông báo đã được vô hiệu hóa để bảo toàn dữ liệu.
                        </p>
                    </div>
                </div>
            )}

            {/* Alert message */}
            {message && (
                <div role="alert" aria-live="polite" className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
                    message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success'
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            : <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        }
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600 ml-4 text-lg leading-none">&times;</button>
                </div>
            )}

            {/* Term Selector + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Term Selector & Quick Communication Actions */}
                <Card className="lg:col-span-1">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <BookOpen className="w-4 h-4 text-sky-600" />
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Bộ lọc Học kỳ & Năm học</span>
                        </div>

                        <AcademicTermFilter
                            terms={terms}
                            selectedTermId={selectedTermId}
                            onTermChange={handleTermChange}
                            variant="stacked"
                            showStatusBadge={true}
                        />

                        {/* Quick action buttons for faculty */}
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                            {/* 1. Batch provision account button */}
                            <Button
                                variant="secondary"
                                onClick={() => setIsBatchProvisionModalOpen(true)}
                                disabled={!selectedTermId || stats.eligibleWithoutAccount === 0 || selectedTerm?.status === 'CLOSED'}
                                className="w-full gap-2 text-xs justify-start border-sky-200 text-sky-800 hover:bg-sky-50"
                                title={stats.eligibleWithoutAccount === 0 ? 'Tất cả sinh viên đủ điều kiện đã có tài khoản' : undefined}
                            >
                                <UserPlus className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                <span className="truncate">Cấp TK nhanh ({stats.eligibleWithoutAccount})</span>
                            </Button>

                            {/* 2. Notify ineligible students button */}
                            <Button
                                variant="secondary"
                                onClick={() => setIsIneligibleEmailModalOpen(true)}
                                disabled={!selectedTermId || stats.ineligible === 0 || selectedTerm?.status === 'CLOSED'}
                                className="w-full gap-2 text-xs justify-start border-rose-200 text-rose-800 hover:bg-rose-50"
                                title={stats.ineligible === 0 ? 'Không có sinh viên nợ điều kiện' : undefined}
                            >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span className="truncate">Gửi mail SV chưa đủ ĐK ({stats.ineligible})</span>
                            </Button>

                            {/* 3. Introduction letter notice */}
                            <Button
                                variant="secondary"
                                onClick={() => setIsEmailModalOpen(true)}
                                disabled={!selectedTermId || stats.eligible === 0 || selectedTerm?.status === 'CLOSED'}
                                className="w-full gap-2 text-xs justify-start"
                                title={selectedTerm?.status === 'CLOSED' ? 'Học kỳ đã đóng, không thể gửi email thông báo' : undefined}
                            >
                                <Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                <span className="truncate">Thông báo nhận giấy ({stats.eligible})</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="lg:col-span-3">
                    <RosterStatsCards
                        stats={stats}
                        onOpenBatchProvision={() => setIsBatchProvisionModalOpen(true)}
                        onOpenIneligibleEmail={() => setIsIneligibleEmailModalOpen(true)}
                    />
                </div>
            </div>

            {/* Search & Filter */}
            <RosterFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterProgram={filterProgram}
                onProgramChange={setFilterProgram}
                programs={programs}
                filteredCount={filtered.length}
                totalCount={roster.length}
            />

            {/* Table */}
            <RosterTable
                isLoading={isLoading}
                students={filtered}
                totalCount={roster.length}
                isTermClosed={selectedTerm?.status === 'CLOSED'}
                onOpenExcelModal={() => setIsExcelModalOpen(true)}
                onOpenManualModal={() => setIsImportModalOpen(true)}
                onProvisionStudent={(s) => {
                    setProvisionTarget(s);
                    setProvisionResult(null);
                }}
            />

            {/* Modals */}
            <ExcelImportModal
                isOpen={isExcelModalOpen}
                onClose={() => setIsExcelModalOpen(false)}
                onSubmit={handleExcelImport}
                isLoading={isActionLoading}
                selectedTermId={selectedTermId}
                programs={programs}
            />

            <ManualAddStudentModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSubmit={handleManualAdd}
                isLoading={isActionLoading}
                programs={programs}
            />

            <BatchProvisionModal
                isOpen={isBatchProvisionModalOpen}
                onClose={() => setIsBatchProvisionModalOpen(false)}
                onConfirm={handleBatchProvision}
                isLoading={isActionLoading}
                eligibleWithoutAccountCount={stats.eligibleWithoutAccount}
                termName={selectedTerm?.termName || 'Kỳ thực tập'}
            />

            <IneligibleNotificationModal
                isOpen={isIneligibleEmailModalOpen}
                onClose={() => setIsIneligibleEmailModalOpen(false)}
                onSubmit={handleNotifyIneligible}
                isLoading={isActionLoading}
                ineligibleCount={stats.ineligible}
                totalCount={stats.total}
                selectedTermId={selectedTermId}
                termName={selectedTerm?.termName || 'Kỳ thực tập'}
            />

            <EmailNotificationModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                onSubmit={handleNotifyPickup}
                isLoading={isActionLoading}
                eligibleCount={stats.eligible}
                totalCount={stats.total}
                selectedTermId={selectedTermId}
            />

            <ProvisionAccountModal
                isOpen={!!provisionTarget && !provisionResult}
                student={provisionTarget}
                onClose={() => setProvisionTarget(null)}
                onConfirm={handleProvisionAccount}
                isLoading={isActionLoading}
            />

            <ProvisionResultModal
                isOpen={!!provisionResult && !!provisionResult.password}
                result={provisionResult}
                onClose={() => {
                    setProvisionResult(null);
                    setProvisionTarget(null);
                }}
            />
        </div>
    );
}

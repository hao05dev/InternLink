'use client';

import React from 'react';
import { useFacultyEvaluations } from '../hooks/use-faculty-evaluations';
import { FacultyEvaluationsHeader } from './faculty-evaluations-header';
import { FacultyEvaluationsStats } from './faculty-evaluations-stats';
import { FacultyEvaluationsFilterToolbar } from './faculty-evaluations-filter-toolbar';
import { FacultyEvaluationsTable } from './faculty-evaluations-table';
import { EvaluationDetailModal } from './modals/evaluation-detail-modal';
import { BatchPublishModal } from './modals/batch-publish-modal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function FacultyEvaluationsView() {
    const {
        terms,
        selectedTermId,
        setSelectedTermId,
        selectedTerm,
        filteredRows,
        isLoadingTerms,
        isLoadingData,
        isProcessing,
        message,
        setMessage,
        searchTerm,
        setSearchTerm,
        programFilter,
        setProgramFilter,
        lecturerFilter,
        setLecturerFilter,
        companyFilter,
        setCompanyFilter,
        resultFilter,
        setResultFilter,
        publishFilter,
        setPublishFilter,
        gradeFilter,
        setGradeFilter,
        filterOptions,
        stats,
        selectedDetail,
        isDetailModalOpen,
        isBatchPublishModalOpen,
        setIsBatchPublishModalOpen,
        openDetailModal,
        closeDetailModal,
        handleQuickFinalize,
        handlePublishSingle,
        handleBatchPublish,
        handleExportExcel,
    } = useFacultyEvaluations();

    const handleResetFilters = () => {
        setSearchTerm('');
        setProgramFilter('ALL');
        setLecturerFilter('ALL');
        setCompanyFilter('ALL');
        setResultFilter('ALL');
        setPublishFilter('ALL');
        setGradeFilter('ALL');
    };

    const hasActiveFilters =
        searchTerm !== '' ||
        programFilter !== 'ALL' ||
        lecturerFilter !== 'ALL' ||
        companyFilter !== 'ALL' ||
        resultFilter !== 'ALL' ||
        publishFilter !== 'ALL' ||
        gradeFilter !== 'ALL';

    return (
        <div className="space-y-6">
            {/* 1. Page Header with Action Buttons */}
            <FacultyEvaluationsHeader
                filteredCount={filteredRows.length}
                draftCount={stats.draft}
                isLoadingData={isLoadingData}
                onExportExcel={handleExportExcel}
                onOpenBatchPublish={() => setIsBatchPublishModalOpen(true)}
            />

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

            {/* 2. Term Selector & KPI Statistics Cards */}
            <FacultyEvaluationsStats
                terms={terms}
                selectedTermId={selectedTermId}
                onSelectTermId={setSelectedTermId}
                isLoadingTerms={isLoadingTerms}
                stats={stats}
            />

            {/* 3. Filter Toolbar */}
            <FacultyEvaluationsFilterToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                programFilter={programFilter}
                onProgramFilterChange={setProgramFilter}
                lecturerFilter={lecturerFilter}
                onLecturerFilterChange={setLecturerFilter}
                companyFilter={companyFilter}
                onCompanyFilterChange={setCompanyFilter}
                resultFilter={resultFilter}
                onResultFilterChange={setResultFilter}
                publishFilter={publishFilter}
                onPublishFilterChange={setPublishFilter}
                gradeFilter={gradeFilter}
                onGradeFilterChange={setGradeFilter}
                filterOptions={filterOptions}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
            />

            {/* 4. Student Evaluation & Grade Table */}
            <FacultyEvaluationsTable
                rows={filteredRows}
                isLoading={isLoadingData}
                hasActiveFilters={hasActiveFilters}
                isProcessing={isProcessing}
                onOpenDetail={openDetailModal}
                onQuickFinalize={handleQuickFinalize}
                onPublishSingle={handlePublishSingle}
            />

            {/* 5. Modals */}
            <EvaluationDetailModal
                isOpen={isDetailModalOpen}
                onClose={closeDetailModal}
                data={selectedDetail}
                onPublishSingle={handlePublishSingle}
                isPublishing={isProcessing}
            />

            <BatchPublishModal
                isOpen={isBatchPublishModalOpen}
                onClose={() => setIsBatchPublishModalOpen(false)}
                termName={selectedTerm ? `${selectedTerm.termName} (${selectedTerm.academicYear})` : ''}
                eligibleCount={stats.draft}
                totalCount={stats.total}
                onConfirm={handleBatchPublish}
                isProcessing={isProcessing}
            />
        </div>
    );
}

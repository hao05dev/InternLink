"use client";

import { PublicShell } from "@/components/layouts/public-shell";
import { usePublicJobSearch } from "@/features/jobs/hooks/use-public-job-search";
import { JobSearchBanner } from "./public-search/job-search-banner";
import { JobSearchFilterSidebar } from "./public-search/job-search-filter-sidebar";
import { JobSearchQuickChips } from "./public-search/job-search-quick-chips";
import { JobSearchEmptyState } from "./public-search/job-search-empty-state";
import { PublicJobCard } from "./cards/public-job-card";

export default function JobSearchView() {
    const {
        filteredJobs,
        loading,
        keyword,
        setKeyword,
        selectedLocation,
        setSelectedLocation,
        selectedFormat,
        setSelectedFormat,
        selectedMajor,
        setSelectedMajor,
        deadlineFilter,
        setDeadlineFilter,
        onlyWithStipend,
        setOnlyWithStipend,
        resetFilters,
        hasActiveFilters,
        isJobActive
    } = usePublicJobSearch();

    return (
        <PublicShell>
            <div className="min-h-screen bg-slate-50/80 py-6 sm:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Banner */}
                    <JobSearchBanner 
                        keyword={keyword}
                        onKeywordChange={setKeyword}
                        onResetKeyword={() => setKeyword("")}
                    />

                    {/* Main Content Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
                        {/* Left Sidebar Filter */}
                        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-5">
                            <JobSearchFilterSidebar 
                                deadlineFilter={deadlineFilter}
                                onSelectDeadlineFilter={setDeadlineFilter}
                                selectedLocation={selectedLocation}
                                onSelectLocation={setSelectedLocation}
                                selectedFormat={selectedFormat}
                                onSelectFormat={setSelectedFormat}
                                selectedMajor={selectedMajor}
                                onSelectMajor={setSelectedMajor}
                                onlyWithStipend={onlyWithStipend}
                                onToggleStipend={setOnlyWithStipend}
                                hasActiveFilters={hasActiveFilters}
                                onResetFilters={resetFilters}
                            />
                        </div>

                        {/* Right Listing Column */}
                        <div className="lg:col-span-3 space-y-4 min-w-0">
                            {/* Result Counter & Quick Filter Chips */}
                            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                    <span className="text-slate-600 font-medium">
                                        Tìm thấy <strong className="text-slate-900 font-bold text-sm">{filteredJobs.length}</strong> vị trí thực tập phù hợp
                                    </span>
                                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 w-fit">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Cập nhật theo thời gian thực
                                    </span>
                                </div>

                                <JobSearchQuickChips 
                                    selectedLocation={selectedLocation}
                                    onSelectLocation={setSelectedLocation}
                                    selectedFormat={selectedFormat}
                                    onSelectFormat={setSelectedFormat}
                                    onlyWithStipend={onlyWithStipend}
                                    onToggleStipend={() => setOnlyWithStipend(prev => !prev)}
                                    deadlineFilter={deadlineFilter}
                                    onSelectDeadlineFilter={setDeadlineFilter}
                                />
                            </div>

                            {/* Job Cards */}
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(n => (
                                        <div key={n} className="bg-white rounded-3xl border border-slate-200 p-6 animate-pulse space-y-4">
                                            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                                            <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                                            <div className="h-10 bg-slate-50 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredJobs.length === 0 ? (
                                <JobSearchEmptyState onResetFilters={resetFilters} />
                            ) : (
                                <div className="space-y-4">
                                    {filteredJobs.map(job => (
                                        <PublicJobCard 
                                            key={job.id} 
                                            job={job} 
                                            isActive={isJobActive(job)} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicShell>
    );
}

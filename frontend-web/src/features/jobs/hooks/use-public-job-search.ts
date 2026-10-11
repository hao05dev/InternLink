"use client";

import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import { jobService } from "@/features/jobs/services/job.service";
import { JobPosition } from "@/features/jobs/types/job.types";

export interface TermOption {
    id: string;
    termName: string;
    academicYear: string;
    semester: string;
    status: string;
}

export type DeadlineFilter = "ALL" | "ACTIVE" | "EXPIRED";

export function usePublicJobSearch() {
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [terms, setTerms] = useState<TermOption[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [keyword, setKeyword] = useState("");
    const [selectedTermId, setSelectedTermId] = useState<string>("ALL");
    const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
    const [selectedFormat, setSelectedFormat] = useState<string>("ALL");
    const [selectedMajor, setSelectedMajor] = useState<string>("ALL");
    const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>("ALL");
    const [onlyWithStipend, setOnlyWithStipend] = useState<boolean>(false);

    // Fetch initial data
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        Promise.all([
            jobService.getPublicJobs().catch(() => [] as JobPosition[]),
            apiClient.get<TermOption[]>("/api/v1/terms").then(res => res.data || []).catch(() => [] as TermOption[])
        ]).then(([jobsData, termsData]) => {
            if (!isMounted) return;
            setJobs(jobsData);
            setTerms(termsData);
            setLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    // Helper: is job active or expired
    const isJobActive = (job: JobPosition) => {
        if (job.status === "CLOSED" || job.closedEarlyAt) return false;
        if (job.isExpired) return false;
        const dl = job.applicationDeadline || job.deadline;
        if (!dl) return true;
        return new Date(dl).getTime() >= Date.now();
    };

    // Client-side multi-criteria filtering + smart ordering (active first, expired last)
    const filteredJobs = useMemo(() => {
        const result = jobs.filter(job => {
            // Keyword match
            const kw = keyword.trim().toLowerCase();
            const matchKw = !kw || 
                job.title.toLowerCase().includes(kw) ||
                job.companyName.toLowerCase().includes(kw) ||
                job.location.toLowerCase().includes(kw) ||
                job.skills?.some(s => s.skillName?.toLowerCase().includes(kw));

            // Term filter
            const matchTerm = selectedTermId === "ALL" || job.termId === selectedTermId;

            // Location filter
            const matchLocation = selectedLocation === "ALL" || 
                job.location.toLowerCase().includes(selectedLocation.toLowerCase());

            // Work format filter
            const matchFormat = selectedFormat === "ALL" || job.workFormat === selectedFormat;

            // Major filter
            const matchMajor = selectedMajor === "ALL" || job.targetProgramCodes?.includes(selectedMajor);

            // Stipend filter
            const matchStipend = !onlyWithStipend || ((job.stipendAmount ?? 0) > 0);

            // Deadline filter
            const active = isJobActive(job);
            const matchDeadline = 
                deadlineFilter === "ALL" ? true :
                deadlineFilter === "ACTIVE" ? active :
                !active;

            return matchKw && matchTerm && matchLocation && matchFormat && matchMajor && matchStipend && matchDeadline;
        });

        // Always sort active positions first, expired positions last for student reference
        return [...result].sort((a, b) => {
            const aActive = isJobActive(a) ? 0 : 1;
            const bActive = isJobActive(b) ? 0 : 1;
            if (aActive !== bActive) return aActive - bActive;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
    }, [jobs, keyword, selectedTermId, selectedLocation, selectedFormat, selectedMajor, onlyWithStipend, deadlineFilter]);

    const resetFilters = () => {
        setKeyword("");
        setSelectedTermId("ALL");
        setSelectedLocation("ALL");
        setSelectedFormat("ALL");
        setSelectedMajor("ALL");
        setDeadlineFilter("ALL");
        setOnlyWithStipend(false);
    };

    const hasActiveFilters = Boolean(
        keyword ||
        selectedTermId !== "ALL" ||
        selectedLocation !== "ALL" ||
        selectedFormat !== "ALL" ||
        selectedMajor !== "ALL" ||
        deadlineFilter !== "ALL" ||
        onlyWithStipend
    );

    return {
        jobs,
        filteredJobs,
        terms,
        loading,
        keyword,
        setKeyword,
        selectedTermId,
        setSelectedTermId,
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
    };
}

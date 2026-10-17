"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { apiClient } from "@/lib/api-client";
import type { StudentProfile } from "@/features/profiles/types/profile.types";
import type { JobPosition } from "../types/job.types";
import { jobService } from "../services/job.service";

export function useJobDetail(id: string) {
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState<JobPosition | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null
  );

  const jobId = id;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setJob(null); setIsApplied(false); setStudentProfile(null); setRelatedJobs([]);
    jobService
      .getJobById(jobId)
      .then((data) => {
        if (mounted) {
          setJob(data);
          jobService.getPublicJobs().then((all) => {
            if (mounted) {
              setRelatedJobs(all.filter((j) => j.id !== jobId).slice(0, 3));
            }
          }).catch(() => {});
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    if (isAuthenticated && user?.role === "STUDENT") {
      apiClient
        .get<StudentProfile>("/api/v1/students/me/profile")
        .then((res) => {
          if (mounted && res.data) {
            setStudentProfile(res.data);
          }
        })
        .catch(() => {});

      jobService.getMyApplications().then((apps) => {
        if (mounted && apps.some((a) => a.jobId === jobId)) {
          setIsApplied(true);
        }
      }).catch(() => {});
    }

    return () => {
      mounted = false;
    };
  }, [jobId, isAuthenticated, user?.role]);

  return { job, relatedJobs, loading, user, isAuthenticated, isApplied, setIsApplied,
    showApplyModal, setShowApplyModal, studentProfile };
}

import { apiClient } from "@/lib/api-client";

export interface Option { id: string; name: string }
export interface Options { terms: Option[]; jobs: Option[]; placements: Option[] }
export interface TaxonomySkill { id: string; skillName: string }
export interface StudentSkill {
    skillId: string; skillName: string; source: string; isConfirmed: boolean;
    aiEvidence?: { assertionStatus?: string; studentEvidence?: string; evidence?: { quote?: string } };
}
export interface Match {
    jobId: string; jobTitle: string; companyName: string; matchScore: number;
    scoreAvailable: boolean; semanticAvailable: boolean; mode: string; missingSkills: string[]; matchedSkills: string[];
    explanation: { recommendation?: string }; warnings: string[];
}
export interface Extraction { status: string; mode?: string; error_code?: string; skills: StudentSkill[] }
export interface LearningPlan {
    status?: string; notice: string; tasks: { skill_id: string; skill_name: string; objective: string;
        task: string; evidence: string; review_criterion: string; estimated_hours: number }[];
}
export interface JournalSummary {
    status?: string; notice: string; entry_count: number;
    claims: { skill_id: string; skill_name: string; entry_id: string; source_version: string; quote: string; verification: string }[];
}
export interface JobReview {
    checklist: { status?: string; issues?: { code: string; message: string; quote?: string }[] };
    extraction: { status?: string; normalized_skills?: { id: string; name: string; requirement_type: string; evidence: { quote: string } }[] };
}
export interface GapReport {
    cohortSize: number; claimedProfiles: number; profilesWithConfirmedSkills?: number; approvedJobs?: number;
    suppressed: boolean; notice: string;
    skills: { id: string; name: string; jobsRequiring: number; confirmedStudents: number | null }[];
}
const base = "/api/v1/ai-workspace";
export const aiApi = {
    options: async () => (await apiClient.get<Options>(base + "/options")).data,
    taxonomy: async () => (await apiClient.get<TaxonomySkill[]>("/api/v1/matching/skills/taxonomy")).data,
    skills: async () => (await apiClient.get<StudentSkill[]>("/api/v1/matching/skills/my-skills")).data,
    extract: async (body: { text?: string; documentId?: string; consent: boolean; allowCloud: boolean }) =>
        (await apiClient.post<Extraction>(base + "/cv", body)).data,
    confirm: async (id: string, confirmed: boolean) => apiClient.patch("/api/v1/matching/skills/" + encodeURIComponent(id) + "/confirm?confirmed=" + confirmed),
    declare: async (id: string, evidence: string) => apiClient.put(base + "/skills/" + encodeURIComponent(id), { evidence }),
    recommend: async (term: string) => (await apiClient.get<Match[]>("/api/v1/matching/recommendations/term/" + term)).data,
    plan: async (skillIds: string[]) => (await apiClient.post<LearningPlan>(base + "/learning-plan", { skillIds, hoursPerWeek: 4 })).data,
    review: async (job: string) => (await apiClient.post<JobReview>(base + "/jobs/" + job + "/review")).data,
    summary: async (placement: string) => (await apiClient.post<JournalSummary>(base + "/placements/" + placement + "/summary")).data,
    gaps: async (term: string) => (await apiClient.get<GapReport>(base + "/terms/" + term + "/skill-gaps")).data,
};

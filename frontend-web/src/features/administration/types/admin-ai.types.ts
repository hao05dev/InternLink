export type AiRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type AiRunType = 'CV_EXTRACTION' | 'JOB_EXTRACTION' | 'EMBEDDING' | 'MATCHING';

export interface AiStats {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    running: number;
}

export interface AiHealth {
    available: boolean;
    geminiConfigured: boolean;
    extractionModel: string | null;
    embeddingModel: string | null;
    checkedAt: string;
}

export interface AiRun {
    id: string;
    runType: AiRunType;
    status: AiRunStatus;
    studentId: string | null;
    studentName: string | null;
    studentEmail: string | null;
    sourceDocumentId: string | null;
    jobId: string | null;
    jobTitle: string | null;
    modelName: string;
    modelVersion: string | null;
    taxonomyVersion: string | null;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
    canRetry: boolean;
}

export interface AiRunDetail {
    run: AiRun;
    inputSnapshot: Record<string, unknown>;
    outputResult: Record<string, unknown> | null;
    errorDetail: Record<string, unknown> | null;
}

export interface AiRunPage {
    content: AiRun[];
    totalElements: number;
    totalPages: number;
    number: number;
}

export interface AiTaxonomy {
    id: string;
    skillName: string;
    category: string;
    framework: string;
    description: string | null;
    aliases: string[];
    taxonomyVersion: string;
    isActive: boolean;
    updatedAt: string;
}

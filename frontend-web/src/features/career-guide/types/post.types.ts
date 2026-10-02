export type PostCategory =
    | 'JOB_FAIR'
    | 'INTERNATIONAL_INTERNSHIP'
    | 'REGULATIONS_GUIDELINES'
    | 'CV_INTERVIEW_SKILLS'
    | 'INTERNSHIP_EXPERIENCE'
    | 'WORKSHOP'
    | 'GENERAL';

export const POST_CATEGORY_LABELS: Record<PostCategory, { label: string; badgeClass: string; iconName?: string }> = {
    JOB_FAIR: {
        label: 'Ngày hội việc làm',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        iconName: 'Briefcase',
    },
    INTERNATIONAL_INTERNSHIP: {
        label: 'Thực tập Quốc tế',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
        iconName: 'Globe',
    },
    REGULATIONS_GUIDELINES: {
        label: 'Quy chế & Hướng dẫn',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        iconName: 'FileText',
    },
    CV_INTERVIEW_SKILLS: {
        label: 'Kỹ năng CV & Phỏng vấn',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        iconName: 'Sparkles',
    },
    INTERNSHIP_EXPERIENCE: {
        label: 'Kinh nghiệm thực tập',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        iconName: 'Award',
    },
    WORKSHOP: {
        label: 'Hội thảo & Workshop',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
        iconName: 'Presentation',
    },
    GENERAL: {
        label: 'Thông báo chung',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        iconName: 'Megaphone',
    },
};

export interface PostAttachment {
    id?: string;
    fileName: string;
    fileUrl: string;
    fileSize?: string;
    fileType?: 'PDF' | 'DOCX' | 'XLSX' | 'ZIP' | 'IMAGE' | 'OTHER';
}

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PostVisibility = 'PUBLIC' | 'STUDENTS_ONLY' | 'FACULTY_ONLY';

export interface PostItem {
    id: string;
    authorUserId?: string;
    authorName?: string;
    departmentId?: string;
    departmentName?: string;
    slug: string;
    title: string;
    category: PostCategory;
    summary: string;
    content: string;
    coverImageUrl?: string;
    attachmentUrls: PostAttachment[];
    tags: string[];
    isPinned: boolean;
    visibility: PostVisibility;
    status: PostStatus;
    viewCount: number;
    readTime?: string;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePostPayload {
    title: string;
    slug?: string;
    category: PostCategory;
    summary: string;
    content: string;
    coverImageUrl?: string;
    attachmentUrls?: PostAttachment[];
    tags?: string[];
    isPinned?: boolean;
    visibility?: PostVisibility;
    status?: PostStatus;
}

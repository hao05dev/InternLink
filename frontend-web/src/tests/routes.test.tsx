import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import JobDetailPage from '@/app/jobs/[id]/page';
import BlogPostDetailPage from '@/app/cam-nang/[slug]/page';

vi.mock('@/features/jobs/components/job-detail-view', () => ({
    default: ({ id }: { id: string }) => <div data-testid="job-id">{id}</div>,
}));

vi.mock('@/features/career-guide/components/blog-post-detail-view', () => ({
    default: ({ slug }: { slug: string }) => <div data-testid="article-slug">{slug}</div>,
}));

describe('dynamic route parameters', () => {
    it('passes the job id into the feature view', () => {
        render(<JobDetailPage params={{ id: 'job-123' }} />);

        expect(screen.getByTestId('job-id')).toHaveTextContent('job-123');
    });

    it('passes the article slug into the feature view', () => {
        render(<BlogPostDetailPage params={{ slug: 'huong-dan-thuc-tap' }} />);

        expect(screen.getByTestId('article-slug')).toHaveTextContent('huong-dan-thuc-tap');
    });
});

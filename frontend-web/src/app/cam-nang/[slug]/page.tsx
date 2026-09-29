import BlogPostDetailView from "@/features/career-guide/components/blog-post-detail-view";

export default function BlogPostDetailPage({ params }: { params: { slug: string } }) {
    return <BlogPostDetailView slug={params.slug} />;
}

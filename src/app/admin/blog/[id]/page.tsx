import BlogEditor from "@/components/admin/blog/BlogEditor";

export default function AdminBlogEditPage({ params }: { params: { id: string } }) {
    return <BlogEditor postId={params.id} />;
}

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function BlogSlugRedirect({ params }: { params: { slug: string } }) {
    redirect(`/blogs/${params.slug}`);
}

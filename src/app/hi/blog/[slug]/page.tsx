import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function HindiBlogSlugRedirect({ params }: { params: { slug: string } }) {
    redirect(`/hi/blogs/${params.slug}`);
}

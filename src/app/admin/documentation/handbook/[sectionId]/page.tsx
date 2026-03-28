import { notFound } from "next/navigation";
import SectionDetailPage from "../../SectionDetailPage";
import { getSection, handbookSections } from "../../docsData";

type Props = {
    params: {
        sectionId: string;
    };
};

export function generateStaticParams() {
    return handbookSections.map((section) => ({ sectionId: section.id }));
}

export default function HandbookSectionPage({ params }: Props) {
    const section = getSection("handbook", params.sectionId);

    if (!section) {
        notFound();
    }

    return <SectionDetailPage mode="handbook" section={section} />;
}

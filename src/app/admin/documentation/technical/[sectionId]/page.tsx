import { notFound } from "next/navigation";
import SectionDetailPage from "../../SectionDetailPage";
import { getSection, technicalSections } from "../../docsData";

type Props = {
    params: {
        sectionId: string;
    };
};

export function generateStaticParams() {
    return technicalSections.map((section) => ({ sectionId: section.id }));
}

export default function TechnicalSectionPage({ params }: Props) {
    const section = getSection("technical", params.sectionId);

    if (!section) {
        notFound();
    }

    return <SectionDetailPage mode="technical" section={section} />;
}

"use client";

import { useParams } from "next/navigation";
import BannerForm from "@/components/admin/cms/BannerForm";

export default function EditBannerPage() {
    const params = useParams();
    const id = params?.id as string;

    return (
        <div className="p-6 md:p-8">
            <BannerForm editId={id} />
        </div>
    );
}

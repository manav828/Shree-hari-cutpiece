import { fetchNotificationConfig } from "@/app/actions/notifications";
import ProviderConfigurator from "@/components/admin/notifications/ProviderConfigurator";

export const dynamic = "force-dynamic";

interface PageProps {
    params: {
        provider: string;
    };
}

export default async function ProviderConfigPage({ params }: PageProps) {
    const config = await fetchNotificationConfig();
    return (
        <div className="max-w-7xl mx-auto">
            <ProviderConfigurator provider={params.provider} initialConfig={config} />
        </div>
    );
}

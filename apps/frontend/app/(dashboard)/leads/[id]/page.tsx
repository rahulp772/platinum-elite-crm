import { LeadDetailSplitView } from "@/components/leads/lead-detail-split-view"

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <LeadDetailSplitView leadId={id} />
}

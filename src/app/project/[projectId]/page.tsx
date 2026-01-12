import ReportActions from "@/components/ReportActions";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    return (
        <div style={{ padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2>Project Dashboard</h2>
                <ReportActions projectId={projectId} />
            </div>
            <div style={{ padding: "2rem", textAlign: "center", color: "#888", background: "var(--card-bg)", borderRadius: "var(--radius)" }}>
                <p>Select an inspection from the sidebar or click "New Inspection" to get started.</p>
            </div>
        </div>
    );
}

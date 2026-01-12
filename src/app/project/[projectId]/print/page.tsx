import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintTrigger from "./PrintTrigger"; // We'll create this small client component to trigger print

export default async function ProjectPrintPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            inspectionInstances: {
                include: {
                    inspectionType: true,
                    nodeResults: true
                }
            }
        }
    });

    if (!project) {
        notFound();
    }

    return (
        <div className="print-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', fontFamily: 'sans-serif', color: '#000' }}>
            <PrintTrigger />

            <header style={{ borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Project Import Report</h1>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <div>
                        <p style={{ margin: 0 }}><strong>Project:</strong> {project.name}</p>
                        <p style={{ margin: '5px 0 0 0' }}><strong>Location:</strong> {project.location}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0 }}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                        <p style={{ margin: '5px 0 0 0' }}><strong>Responsible:</strong> {project.responsible}</p>
                    </div>
                </div>
            </header>

            <section>
                <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>Inspection Summary</h2>

                {project.inspectionInstances.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: '#666' }}>No inspections recorded for this project.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {project.inspectionInstances.map((inst) => {
                            const totalNodes = inst.nodeResults.length;
                            const completedNodes = inst.nodeResults.filter(n => n.status === 'Pass' || n.status === 'Fail' || n.status === 'NA').length;

                            return (
                                <div key={inst.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '4px', breakInside: 'avoid' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{inst.inspectionType.name}</h3>
                                    <div style={{ fontSize: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div><strong>Status:</strong> {inst.status}</div>
                                        <div><strong>ITP Number:</strong> {inst.itpNumber || 'N/A'}</div>
                                        <div><strong>Completion:</strong> {completedNodes} / {totalNodes} Nodes</div>
                                        <div><strong>Updated:</strong> {new Date(inst.updatedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none; }
                }
            `}</style>
        </div>
    );
}

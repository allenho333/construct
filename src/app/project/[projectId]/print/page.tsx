import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintTrigger from "./PrintTrigger";

export default async function ProjectPrintPage({
    params,
    searchParams
}: {
    params: Promise<{ projectId: string }>;
    searchParams: Promise<{ instanceId?: string }>;
}) {
    const { projectId } = await params;
    const { instanceId } = await searchParams;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            inspectionInstances: {
                include: {
                    inspectionType: {
                        include: {
                            nodeTemplates: {
                                orderBy: { orderIndex: 'asc' }
                            }
                        }
                    },
                    nodeResults: true
                }
            }
        }
    });

    if (!project) {
        notFound();
    }

    return (
        <div className="print-container">
            <PrintTrigger />

            {/* Report Header */}
            <header className="report-header">
                <div className="brand">
                    <h1>CONSTRUCT</h1>
                    {/* Placeholder for Logo if needed */}
                </div>
                <div className="project-info">
                    <h2>{instanceId ? "Inspection Report" : "Project Inspection Report"}</h2>
                    <p><strong>Project:</strong> {project.name}</p>
                    <p><strong>Location:</strong> {project.location || "N/A"}</p>
                    <p><strong>Date Generated:</strong> {new Date().toLocaleDateString()}</p>
                </div>
            </header>

            {project.inspectionInstances.length === 0 ? (
                <p className="no-data">No inspections recorded for this project.</p>
            ) : (
                <div className="instances-list">
                    {project.inspectionInstances
                        .filter(inst => !instanceId || inst.id === instanceId)
                        .map((inst) => {
                            const templates = inst.inspectionType.nodeTemplates;
                            // Separate header node (Room & Item Detail) vs Checklist
                            const headerTemplate = templates.find(t => t.name === "Room & Item Detail");
                            const checklistTemplates = templates.filter(t => t.name !== "Room & Item Detail");

                            // Get Header Data
                            let roomCode = "N/A";
                            let itemCode = "N/A";
                            if (headerTemplate) {
                                const result = inst.nodeResults.find(r => r.nodeTemplateId === headerTemplate.id);
                                if (result?.value) {
                                    try {
                                        const val = JSON.parse(result.value);
                                        roomCode = val["Room Code"] || "N/A";
                                        itemCode = val["Item Code"] || "N/A";
                                    } catch (e) { }
                                }
                            }

                            return (
                                <div key={inst.id} className="inspection-instance">
                                    <div className="instance-header">
                                        <div className="instance-title">
                                            <h3>{inst.inspectionType.name}</h3>
                                            <span className={`status-tag ${inst.status.toLowerCase()}`}>{inst.status}</span>
                                        </div>
                                        <div className="instance-meta">
                                            <div><strong>ITP Number:</strong> {inst.itpNumber || "Pending"}</div>
                                            <div><strong>Room:</strong> {roomCode}</div>
                                            <div><strong>Item:</strong> {itemCode}</div>
                                            <div><strong>Date:</strong> {new Date(inst.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    <table className="checklist-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '30%' }}>Checkpoint</th>
                                                <th style={{ width: '15%' }}>Result</th>
                                                <th style={{ width: '25%' }}>Details</th>
                                                <th style={{ width: '30%' }}>Evidence</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {checklistTemplates.map(node => {
                                                const result = inst.nodeResults.find(r => r.nodeTemplateId === node.id);
                                                let values: any = {};
                                                try {
                                                    if (result?.value) values = JSON.parse(result.value);
                                                } catch (e) { }

                                                const status = result?.status || "Pending";
                                                const validation = values["Validation"];
                                                const reasons = values["Dissatisfied reason tags"];

                                                // Extract photo URLs (Generic 'photo' type or specific names like 'Photo of window...')
                                                // We look for any value that is an array of strings (urls) from ImageUploader
                                                let photos: string[] = [];
                                                Object.keys(values).forEach(key => {
                                                    const val = values[key];
                                                    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string' && val[0].startsWith('blob:')) {
                                                        // Note: Blob URLs won't work in PDF unless we inline them or they are real URLs.
                                                        // Sincce we are using mockUpload returning blob URLs, this will be broken in real print unless user uploads real images.
                                                        // For now, we render them. In production, these would be S3 URLs.
                                                        photos.push(...val);
                                                    }
                                                });

                                                return (
                                                    <tr key={node.id}>
                                                        <td>
                                                            <div className="node-name">{node.name}</div>
                                                            <div className="node-desc">{node.description}</div>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${status.toLowerCase()}`}>
                                                                {status}
                                                            </span>
                                                            {validation && status !== 'Pending' && (
                                                                <div className="validation-text">{validation}</div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {reasons && Array.isArray(reasons) && reasons.length > 0 && (
                                                                <div className="reasons">
                                                                    <strong>Issues:</strong>
                                                                    <ul>
                                                                        {reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {/* Could add comments here if we had a comment field */}
                                                        </td>
                                                        <td>
                                                            {photos.length > 0 ? (
                                                                <div className="photo-grid">
                                                                    {photos.map((url, i) => (
                                                                        <div key={i} className="photo-thumb">
                                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                            <img src={url} alt="Evidence" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : <span className="no-evidence">-</span>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                </div>
            )}

            <div className="report-footer">
                <p>Generated by Construct App</p>
                <div className="signatures">
                    <div className="sig-block">
                        <div className="sig-line"></div>
                        <p>Inspector Signature</p>
                    </div>
                    <div className="sig-block">
                        <div className="sig-line"></div>
                        <p>Client Signature</p>
                    </div>
                </div>
            </div>

            <style>{`
                /* Global Report Styles */
                .print-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 40px;
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    color: #333;
                    background: #fff;
                }
                .report-header {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                    margin-bottom: 40px;
                }
                .brand h1 { margin: 0; font-size: 24px; letter-spacing: 2px; }
                .project-info p { margin: 4px 0; font-size: 14px; }
                
                .inspection-instance {
                    margin-bottom: 50px;
                    page-break-inside: avoid;
                }
                .instance-header {
                    background: #f9f9f9;
                    padding: 15px;
                    border-radius: 4px;
                    border: 1px solid #eee;
                    margin-bottom: 15px;
                }
                .instance-title {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .instance-title h3 { margin: 0; font-size: 18px; }
                .instance-meta {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    font-size: 13px;
                }

                .checklist-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }
                .checklist-table th {
                    text-align: left;
                    border-bottom: 2px solid #ddd;
                    padding: 8px;
                    font-weight: 600;
                    color: #555;
                }
                .checklist-table td {
                    border-bottom: 1px solid #eee;
                    padding: 12px 8px;
                    vertical-align: top;
                }
                .node-name { font-weight: 600; margin-bottom: 4px; }
                .node-desc { font-size: 11px; color: #777; font-style: italic; }

                .status-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .status-badge.pass, .status-badge.completed { background: #dcfce7; color: #166534; }
                .status-badge.fail { background: #fee2e2; color: #991b1b; }
                .status-badge.pending { background: #f3f4f6; color: #4b5563; }
                
                .validation-text { margin-top: 4px; font-size: 11px; font-weight: 500; }
                
                .reasons ul { margin: 4px 0 0 0; padding-left: 16px; font-size: 11px; color: #d946ef; }
                
                .photo-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }
                .photo-thumb {
                    width: 100%;
                    aspect-ratio: 4/3;
                    background: #eee;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .photo-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .report-footer {
                    margin-top: 60px;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                    font-size: 12px;
                    color: #888;
                }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 60px;
                }
                .sig-block { width: 40%; text-align: center; }
                .sig-line { border-top: 1px solid #333; margin-bottom: 8px; }

                @media print {
                    body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
                    .print-container { width: 100%; max-width: none; padding: 20px; margin: 0; }
                    .no-print { display: none; }
                    .checklist-table tr { page-break-inside: avoid; }
                }
            `}</style>
        </div>
    );
}

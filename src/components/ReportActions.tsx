"use client";

import { useState } from "react";
import { Button, Input, Popover, Toast } from "antd-mobile";
import {
    EnvelopeIcon,
    DocumentTextIcon,
    EllipsisHorizontalIcon,
    ShareIcon
} from "@heroicons/react/24/outline";
import { getUserEmail, sendProjectReport } from "@/app/report-actions";

export default function ReportActions({ projectId, instanceId }: { projectId: string, instanceId?: string }) {
    // Email Dialog State
    const [loading, setLoading] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // --- Email Logic ---
    const handleOpenEmailDialog = async () => {
        setLoading(true);
        setStatusMsg(null);
        try {
            console.log("Fetching user email...");
            const savedEmail = await getUserEmail();
            setEmail(savedEmail || "allen731860572@hotmail.com");
            setDialogVisible(true);
        } catch (error) {
            console.error("Error fetching email:", error);
            setEmail("allen731860572@hotmail.com");
            setDialogVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!email) {
            setStatusMsg({ type: 'error', text: "Please enter an email address" });
            return;
        }

        setStatusMsg(null);
        setLoading(true);

        try {
            const result = await sendProjectReport(projectId, email, instanceId);
            if (result.success) {
                setStatusMsg({ type: 'success', text: "Report sent successfully!" });
                setTimeout(() => {
                    setDialogVisible(false);
                    setStatusMsg(null);
                }, 1500);
            } else {
                setStatusMsg({ type: 'error', text: "Failed to send report" });
            }
        } catch (error) {
            console.error("Error sending report:", error);
            setStatusMsg({ type: 'error', text: "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };

    // --- PDF Logic ---
    const handleDownloadPdf = () => {
        const url = `/project/${projectId}/print${instanceId ? `?instanceId=${instanceId}` : ''}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // --- Menu Actions ---
    const actions = [
        { key: 'email', text: 'Email Report', icon: <EnvelopeIcon width={20} /> },
        { key: 'pdf', text: 'Download PDF', icon: <DocumentTextIcon width={20} /> },
    ];

    return (
        <>
            <Popover.Menu
                actions={actions}
                placement='bottom-end'
                onAction={(node) => {
                    if (node.key === 'email') handleOpenEmailDialog();
                    if (node.key === 'pdf') handleDownloadPdf();
                }}
                trigger='click'
            >
                <Button
                    size="small"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        paddingLeft: '12px',
                        paddingRight: '12px'
                    }}
                >
                    <ShareIcon width={18} />
                    <span>Share / Export</span>
                </Button>
            </Popover.Menu>

            {/* Custom Email Modal */}
            {dialogVisible && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '340px',
                        padding: '24px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.1rem', fontWeight: 600, textAlign: 'center' }}>
                            Email Project Report
                        </h3>

                        <div style={{ marginTop: 12 }}>
                            <p style={{ marginBottom: 12, fontSize: '0.9rem', color: '#666', lineHeight: '1.4', textAlign: 'center' }}>
                                We'll send the report to this address. It will be saved as your default.
                            </p>
                            <Input
                                value={email}
                                onChange={setEmail}
                                placeholder="name@example.com"
                                type="email"
                                style={{
                                    border: '1px solid #e5e7eb',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    width: '100%',
                                    fontSize: '1rem'
                                }}
                            />
                            {statusMsg && (
                                <div style={{
                                    marginTop: 8,
                                    fontSize: '0.85rem',
                                    color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
                                    textAlign: 'center'
                                }}>
                                    {statusMsg.text}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <Button
                                block
                                fill="none"
                                color="default"
                                onClick={() => setDialogVisible(false)}
                                style={{ flex: 1, borderRadius: '8px' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                block
                                color="primary"
                                onClick={handleSendEmail}
                                loading={loading && dialogVisible}
                                style={{ flex: 1, borderRadius: '8px' }}
                            >
                                Send
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Button, Dialog, Toast, Input } from "antd-mobile";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { getUserEmail, sendProjectReport } from "@/app/report-actions";

export default function EmailReportButton({ projectId }: { projectId: string }) {
    const [loading, setLoading] = useState(false);

    const handleclick = async () => {
        setLoading(true);
        // 1. Fetch saved email
        const savedEmail = await getUserEmail();
        setLoading(false);

        // 2. Prompt user
        Dialog.confirm({
            title: "Email Project Report",
            content: (
                <div style={{ marginTop: 8 }}>
                    <p style={{ marginBottom: 8, fontSize: '0.9rem', color: '#666' }}>
                        We'll send the report to this address. It will be saved as your default.
                    </p>
                    <Input
                        id="email-input"
                        defaultValue={savedEmail || ""}
                        placeholder="name@example.com"
                        type="email"
                        style={{ border: '1px solid #ddd', padding: '4px 8px', borderRadius: 4 }}
                    />
                </div>
            ),
            confirmText: "Send Report",
            onConfirm: async () => {
                const input = document.getElementById("email-input") as HTMLInputElement;
                const email = input?.value;

                if (!email) {
                    Toast.show({ content: "Please enter an email address", icon: 'fail' });
                    return;
                }

                const result = await sendProjectReport(projectId, email);
                if (result.success) {
                    Toast.show({ content: "Report sent!", icon: 'success' });
                } else {
                    Toast.show({ content: "Failed to send", icon: 'fail' });
                }
            },
        });
    };

    return (
        <Button
            onClick={handleclick}
            loading={loading}
            size="small"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginLeft: 'auto'
            }}
        >
            <EnvelopeIcon width={18} />
            <span>Email Report</span>
        </Button>
    );
}

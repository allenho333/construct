"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon, ChevronLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { ActionSheet } from "antd-mobile";
import { createInspection, deleteInspection } from "@/app/actions";
import LogoutButton from "@/components/LogoutButton";

// Cleaned ProjectShell
export default function ProjectShell({
    children,
    projectName,
    projectId,
    inspectionTypes
}: {
    children: React.ReactNode;
    projectName: string;
    projectId: string;
    inspectionTypes: any[];
}) {
    const [actionSheetVisible, setActionSheetVisible] = useState(false);
    const pathname = usePathname();

    const handleCreate = async (typeId: string) => {
        setActionSheetVisible(false);
        await createInspection(projectId, typeId);
    };

    const actions = inspectionTypes.map(type => ({
        text: type.name,
        key: type.id,
        onClick: () => handleCreate(type.id)
    }));

    // Determine Back Link
    const isInspectionDetail = pathname.includes('/inspection/') && pathname.split('/').pop() !== 'inspection';
    const backHref = isInspectionDetail ? `/project/${projectId}/inspection` : '/project';

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* Header */}
            <header className="mobile-header" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                background: '#fff',
                height: '56px'
            }}>
                <Link href={backHref} style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#333',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '16px'
                }}>
                    <ChevronLeftIcon width={20} style={{ marginRight: '4px' }} />
                    {isInspectionDetail ? "Discard" : "Back"}
                </Link>
                <div style={{
                    flex: 1,
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '18px',
                    paddingRight: '40px'
                }}>
                    {projectName}
                </div>
            </header>

            {/* Main Content */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                <main style={{ height: "100%", overflowY: "auto", width: "100%", padding: "0" }}>
                    {children}
                </main>
            </div>

            <ActionSheet
                visible={actionSheetVisible}
                actions={actions}
                onClose={() => setActionSheetVisible(false)}
            />
        </div>
    );
}

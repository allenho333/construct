"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon, ChevronLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { ActionSheet } from "antd-mobile";
import { createInspection, deleteInspection } from "@/app/actions";
import LogoutButton from "@/components/LogoutButton";

export default function ProjectShell({
    children,
    projectName,
    projectId,
    instances,
    inspectionTypes
}: {
    children: React.ReactNode;
    projectName: string;
    projectId: string;
    instances: any[]; // Using any for simplicity in shell, ideally typed
    inspectionTypes: any[];
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [actionSheetVisible, setActionSheetVisible] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleCreate = async (typeId: string) => {
        setActionSheetVisible(false);
        setIsSidebarOpen(false); // Close sidebar if open
        await createInspection(projectId, typeId);
    };

    const handleDelete = async (e: React.MouseEvent, instanceId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm("Are you sure you want to delete this inspection? This action cannot be undone.")) {
            // Delete
            await deleteInspection(instanceId, projectId);

            // If we are currently on this page, go back to project root
            if (pathname.includes(instanceId)) {
                router.push(`/project/${projectId}`);
            }
        }
    };

    const actions = inspectionTypes.map(type => ({
        text: type.name,
        key: type.id,
        onClick: () => handleCreate(type.id)
    }));

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* Mobile Header */}
            <header className="mobile-header">
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)} style={{ background: "none", border: "none", color: "var(--adm-color-text)" }}>
                        <Bars3Icon width={24} />
                    </button>
                    <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{projectName}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Link href="/" style={{ color: "var(--adm-color-primary)" }}>
                        <ChevronLeftIcon width={24} />
                    </Link>
                </div>
            </header>

            {/* Main Container */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>

                {/* Sidebar / Drawer */}
                <aside
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: "280px",
                        background: "var(--adm-color-background)",
                        borderRight: "1px solid var(--adm-color-border)",
                        zIndex: 100,
                        transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
                        transition: "transform 0.3s ease",
                        padding: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: isSidebarOpen ? "0 4px 12px rgba(0,0,0,0.15)" : "none"
                    }}
                    className="sidebar-drawer"
                >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <h3 style={{ margin: 0 }}>Inspections</h3>
                        <button onClick={() => setIsSidebarOpen(false)} style={{ background: "none", border: "none", color: 'var(--adm-color-text)' }}>
                            <XMarkIcon width={24} />
                        </button>
                    </div>

                    <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {instances.map((inst) => {
                            const isActive = pathname.includes(inst.id);
                            return (
                                <Link
                                    key={inst.id}
                                    href={`/project/${projectId}/${inst.id}`}
                                    onClick={() => setIsSidebarOpen(false)} // Close on navigate
                                    style={{
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        background: isActive ? "var(--adm-color-primary)" : "var(--adm-color-box)",
                                        color: isActive ? "#fff" : "var(--adm-color-text)",
                                        fontWeight: isActive ? 600 : 400,
                                        fontSize: "0.9rem",
                                        transition: "all 0.2s",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                                    <div>
                                        <div style={{ marginBottom: "0.25rem" }}>{inst.itpNumber || "No Number"}</div>
                                        <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>{inst.inspectionType.name}</div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, inst.id)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: isActive ? "inherit" : "var(--adm-color-danger, #ef4444)",
                                            opacity: 0.7,
                                            cursor: "pointer",
                                            padding: "4px"
                                        }}
                                        title="Delete Inspection"
                                    >
                                        <TrashIcon width={18} />
                                    </button>
                                </Link>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                        <button
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--adm-color-border)',
                                background: 'var(--adm-color-box)',
                                color: 'var(--adm-color-text)',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: 500
                            }}
                            onClick={() => setActionSheetVisible(true)}
                        >
                            + New Inspection
                        </button>
                    </div>

                    <div className="sidebar-footer" style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--adm-color-border)" }}>
                        <LogoutButton minimal />
                    </div>
                </aside>

                {/* Desktop Styles Injection for Sidebar Persistence */}
                {/* Backdrop */}

                {/* Backdrop */}
                {isSidebarOpen && (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }}
                    />
                )}

                {/* Content */}
                <main style={{ flex: 1, overflowY: "auto", width: "100%", padding: "0" }}>
                    {children}
                </main>
            </div>

            <ActionSheet
                visible={actionSheetVisible}
                actions={actions}
                onClose={() => setActionSheetVisible(false)}
            />

            {/* Desktop Styles Injection for Sidebar Persistence */}
            <style jsx global>{`
        @media (min-width: 768px) {
          .sidebar-drawer {
            position: relative !important;
            transform: none !important;
            box-shadow: none !important;
            border-right: 1px solid var(--adm-color-border) !important;
          }
          .mobile-header .menu-toggle {
             display: none;
          }
          .sidebar-footer {
             margin-top: auto;
             padding-top: 1rem;
             border-top: 1px solid var(--adm-color-border) !important;
          }
        }
      `}</style>
        </div>
    );
}

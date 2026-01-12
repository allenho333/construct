"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { ActionSheet } from "antd-mobile";
import { createInspection } from "@/app/actions";

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

    const handleCreate = async (typeId: string) => {
        setActionSheetVisible(false);
        setIsSidebarOpen(false); // Close sidebar if open
        await createInspection(projectId, typeId);
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
                    <button onClick={() => setIsSidebarOpen(true)} style={{ background: "none", border: "none" }}>
                        <Bars3Icon width={24} />
                    </button>
                    <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{projectName}</span>
                </div>
                <Link href="/" style={{ color: "var(--primary)" }}>
                    <ChevronLeftIcon width={24} />
                </Link>
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
                        background: "var(--background)",
                        borderRight: "1px solid var(--border-color)",
                        zIndex: 100,
                        transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
                        transition: "transform 0.3s ease",
                        padding: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: isSidebarOpen ? "var(--shadow)" : "none"
                        // Note: On desktop we might want this static, but for mobile-first strictness, let's keep it behaving like an app drawer for now or add media query for desktop persistence.
                    }}
                    className="sidebar-drawer"
                >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <h3>Inspections</h3>
                        <button onClick={() => setIsSidebarOpen(false)} style={{ background: "none", border: "none" }}>
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
                                        borderRadius: "var(--radius)",
                                        background: isActive ? "var(--primary)" : "var(--secondary)",
                                        color: isActive ? "var(--primary-foreground)" : "var(--foreground)",
                                        fontWeight: isActive ? 600 : 400,
                                        fontSize: "0.9rem",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    <div style={{ marginBottom: "0.25rem" }}>{inst.itpNumber || "No Number"}</div>
                                    <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>{inst.inspectionType.name}</div>
                                </Link>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setActionSheetVisible(true)}
                        >
                            + New Inspection
                        </button>
                    </div>
                </aside>

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
            border-right: 1px solid var(--border-color);
          }
          .mobile-header button {
             display: none;
          }
        }
      `}</style>
        </div>
    );
}

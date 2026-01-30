"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Modal } from "antd-mobile";
import { logout } from "@/app/auth-actions";
import { deleteProject } from "@/app/project-actions";
import styles from "./project.module.css";

type Project = {
    id: string;
    name: string;
    location: string | null;
    responsible: string | null;
};

export default function ProjectListClient({ projects }: { projects: Project[] }) {
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
    const router = useRouter();

    const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
        e.preventDefault();
        e.stopPropagation();
        setProjectToDelete({ id: project.id, name: project.name });
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (projectToDelete) {
            const result = await deleteProject(projectToDelete.id);
            setDeleteModalVisible(false);
            setProjectToDelete(null);

            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || "Failed to delete project");
            }
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className="mobile-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0px',
                background: '#fff',
                height: '56px',
                marginBottom: '20px'
            }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#333',
                        background: 'none',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    <ChevronLeftIcon width={20} style={{ marginRight: '4px' }} />
                    Log Out
                </button>
                <div style={{ flex: 1, textAlign: 'right' }}>
                    <img src="/logo.png" alt="Constructoo" style={{ height: '40px' }} />
                </div>
            </header>

            <h1 className={styles.headerTitle}>Certifying Passer</h1>
            <p className={styles.subtitle} style={{ marginBottom: '32px' }}>
                Select or create a project to get started.
            </p>

            <div className={styles.subHeader} style={{ alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>My projects</h2>
                <Link href="/project/create" className={styles.createButton} style={{ width: 'auto', height: '36px', fontSize: '14px', padding: '0 16px', textDecoration: 'none' }}>
                    Create Project
                </Link>
            </div>

            <div className={styles.inspectionList}>
                {projects.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>No projects found.</p>
                ) : (
                    projects.map((project) => (
                        <Link href={`/project/${project.id}/inspection`} key={project.id} className={styles.card}>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{project.name}</h3>
                                <p className={styles.cardDetail}>{project.location}</p>
                                <p className={styles.cardDetail} style={{ marginTop: '8px' }}>Manager: {project.responsible}</p>
                            </div>
                            <div className={styles.cardActions}>
                                <div onClick={(e) => handleDeleteClick(e, project)}>
                                    <TrashIcon className={styles.deleteIcon} />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <Modal
                visible={deleteModalVisible}
                content={
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: '#000' }}>
                            Delete "{projectToDelete?.name}"?
                        </div>
                        <div style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
                            This will permanently delete the project and all its inspections. This action cannot be undone.
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    flex: 1,
                                    height: "44px",
                                    borderRadius: "8px",
                                    border: "1px solid #fb5c2c",
                                    background: "#fff",
                                    color: "#fb5c2c",
                                    fontWeight: 600,
                                    fontSize: "16px",
                                    cursor: "pointer"
                                }}
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setDeleteModalVisible(false)}
                                style={{
                                    flex: 1,
                                    height: "44px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: "#3b5998",
                                    color: "#fff",
                                    fontWeight: 600,
                                    fontSize: "16px",
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                }
                onClose={() => setDeleteModalVisible(false)}
                showCloseButton={false}
                bodyStyle={{
                    borderRadius: "16px",
                    padding: "24px 20px"
                }}
            />
        </div>
    );
}

"use client";

import { useState } from "react";
import styles from "../project.module.css";
import { ActionSheet, Modal, Button } from "antd-mobile";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { createInspection, deleteInspection } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function ProjectDashboard({ project, inspections, types }: any) {
    const [actionSheetVisible, setActionSheetVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const router = useRouter();

    const handleCreate = async (typeId: string) => {
        setActionSheetVisible(false);
        await createInspection(project.id, typeId);
        router.refresh();
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            await deleteInspection(itemToDelete, project.id);
            setDeleteModalVisible(false);
            setItemToDelete(null);
            router.refresh();
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, instanceId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setItemToDelete(instanceId);
        setDeleteModalVisible(true);
    };

    const actions = types.map((type: any) => ({
        text: type.name,
        key: type.id,
        onClick: () => handleCreate(type.id)
    }));

    return (
        <div className={styles.container}>
            <h1 className={styles.headerTitle}>Inspection</h1>

            <div className={styles.subHeader}>
                <p className={styles.subtitle}>Select or create an inspection.</p>
            </div>

            <div className={styles.inspectionList}>
                {inspections.map((inst: any) => (
                    <Link
                        href={`/project/${project.id}/inspection/${inst.id}`}
                        key={inst.id}
                        className={styles.card}
                    >
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{inst.inspectionType.name}</h3>
                            <p className={styles.cardDetail}>Room: {inst.locationReference || "N/A"}</p>
                            <p className={styles.cardDetail}>Item Code: {inst.itemReference || "N/A"}</p>
                            <p className={styles.cardDetail}>Remarks: {inst.itpNumber || "-"}</p>
                        </div>
                        <div className={styles.cardActions}>
                            <PencilSquareIcon className={styles.actionIcon} />
                            <div onClick={(e) => handleDeleteClick(e, inst.id)}>
                                <TrashIcon className={styles.deleteIcon} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className={styles.createButtonContainer}>
                <button className={styles.createButton} onClick={() => setActionSheetVisible(true)}>
                    Create Inspection
                </button>
            </div>

            <ActionSheet
                visible={actionSheetVisible}
                actions={actions}
                onClose={() => setActionSheetVisible(false)}
            />

            <Modal
                visible={deleteModalVisible}
                content={
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: '#000' }}>
                            Do you confirm to delete it?
                        </div>
                        <div style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
                            The file is not retrievable after deleted.
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
                                    background: "#3b5998", // Approx blue from screenshot
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

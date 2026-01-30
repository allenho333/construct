"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { Form, Input, Selector, ImageUploader, Button } from 'antd-mobile';
import { ImageUploadItem } from 'antd-mobile/es/components/image-uploader';
import { CheckCircleFill, CloseCircleFill, MinusOutline, DownOutline } from 'antd-mobile-icons';
import { submitInspection, saveNodeResult } from "@/app/inspection-actions";

type NodeTemplate = {
    id: string;
    name: string;
    description: string | null;
    inputType: string;
    options: string | null;
    orderIndex: number;
};

type NodeResult = {
    nodeTemplateId: string;
    status: string; // 'Pass', 'Fail', 'Pending'
    value?: string | null;
    comment?: string | null;
    photos?: string | null;
};

export type HeaderMetadata = {
    itpNumber: string | null;
    status: string;
    locationReference: string | null;
    itemReference: string | null;
};

type Props = {
    nodes: NodeTemplate[];
    initialResults?: NodeResult[];
    headerMetadata?: HeaderMetadata;
    projectId: string;
    instanceId: string;
    // Add callback to refresh data
    onDataSaved?: () => void;
};

// Collapsible Card Component
const ChecklistCard = ({ node, result, instanceId }: {
    node: NodeTemplate;
    result?: NodeResult;
    instanceId: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Parse fields once
    const fields: any[] = React.useMemo(() => {
        if (node.inputType !== 'form_group') return [];
        try {
            return typeof node.options === 'string' ? JSON.parse(node.options) : [];
        } catch { return []; }
    }, [node]);

    // Local state for form values - Hydrate from result
    const [values, setValues] = useState<Record<string, any>>(() => {
        if (result?.value) {
            try {
                return JSON.parse(result.value);
            } catch { return {}; }
        }
        return {};
    });

    // Re-hydrate if result changes (e.g. on refresh/navigation)
    React.useEffect(() => {
        if (result?.value) {
            try {
                const parsed = JSON.parse(result.value);
                setValues(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
                        return parsed;
                    }
                    return prev;
                });
            } catch { }
        }
    }, [result?.value]);

    /* Parsing Description for Instruction and Tip */
    const { instruction, tip } = React.useMemo(() => {
        if (!node.description) return { instruction: null, tip: null };
        const parts = node.description.split("Tip:");
        return {
            instruction: parts[0]?.trim(),
            tip: parts[1]?.trim()
        };
    }, [node.description]);

    // Derived Status
    const isCompleted = React.useMemo(() => {
        if (fields.length === 0) return !!values["Value"];
        const validation = values["Validation"];
        if (!validation) return false;
        const hasPhotoField = fields.some(f => f.inputType === 'photo');
        if (hasPhotoField) {
            const photoVal = values[fields.find(f => f.inputType === 'photo')?.name || ""];
            if (!photoVal || (Array.isArray(photoVal) && photoVal.length === 0)) return false;
        }
        if (validation === "Dissatisfied") {
            const reasons = values["Dissatisfied reason tags"];
            if (!reasons || (Array.isArray(reasons) && reasons.length === 0)) return false;
        }
        return true;
    }, [values, fields]);

    const calculatedStatus = React.useMemo(() => {
        if (!isCompleted) return "Pending";
        if (values["Validation"] === "Satisfied") return "Pass";
        if (values["Validation"] === "Dissatisfied") return "Fail";
        return "Completed";
    }, [isCompleted, values]);

    // Auto-save Effect
    const saveTimeout = React.useRef<NodeJS.Timeout | null>(null);
    const lastSavedValues = React.useRef(JSON.stringify(values));

    React.useEffect(() => {
        const currentValuesStr = JSON.stringify(values);
        if (currentValuesStr === lastSavedValues.current) return;

        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(async () => {
            console.log(`Saving node ${node.name}...`, values);
            await saveNodeResult(instanceId, node.id, values, calculatedStatus);
            lastSavedValues.current = currentValuesStr;
        }, 1000); // 1s debounce

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [values, calculatedStatus, instanceId, node.id, node.name]);


    // Mock upload
    const mockUpload = async (file: File): Promise<ImageUploadItem> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    url: URL.createObjectURL(file), // Mock URL
                });
            }, 1000);
        });
    };

    // Helper to update values
    const handleChange = (key: string, val: any) => {
        setValues(prev => ({ ...prev, [key]: val }));
    };

    // Render Logic Breakdown
    const photoFields = fields.filter(f => f.inputType === 'photo');
    const tagField = fields.find(f => f.name === 'Dissatisfied reason tags');
    const validationField = fields.find(f => f.name === 'Validation');

    const renderPhotos = () => {
        if (photoFields.length === 0) return null;
        return (
            <div style={{ marginTop: 20 }}>
                <h4 style={{ color: '#003366', fontSize: '1rem', fontWeight: 700, margin: '0 0 10px 0' }}>Photos</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {photoFields.map((field, idx) => (
                        <div key={idx} style={{ background: '#f9f9f9', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ marginBottom: 8 }}>
                                <ImageUploader
                                    upload={mockUpload}
                                    maxCount={1}
                                    value={values[field.name] || []}
                                    onChange={(v) => handleChange(field.name, v)}
                                    style={{ '--cell-size': '80px' }}
                                />
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.2 }}>{field.description || field.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderTags = () => {
        if (!tagField) return null;
        const options = tagField.options || [];
        const currentVal = values[tagField.name] || [];

        return (
            <div style={{ marginTop: 20 }}>
                <h4 style={{ color: '#003366', fontSize: '1rem', fontWeight: 700, margin: '0 0 10px 0' }}>Dissatisfied Tags</h4>
                <Selector
                    options={options.map((opt: string) => ({ label: opt, value: opt }))}
                    multiple
                    value={currentVal}
                    onChange={(v) => handleChange(tagField.name, v)}
                    style={{
                        '--border-radius': '100px',
                        '--checked-color': '#e6f7ff',
                        '--checked-text-color': '#003366',
                        '--checked-border': '1px solid #003366',
                        '--padding': '6px 12px'
                    }}
                />
            </div>
        );
    };

    const renderValidation = () => {
        if (!validationField) return null;
        const currentVal = values[validationField.name];

        return (
            <div style={{ marginTop: 20 }}>
                <h4 style={{ color: '#003366', fontSize: '1rem', fontWeight: 700, margin: '0 0 10px 0' }}>Validation</h4>
                <div style={{ display: 'flex', gap: 12 }}>
                    {['Satisfied', 'Dissatisfied'].map((opt) => {
                        const isSelected = currentVal === opt;
                        const isSatisfied = opt === 'Satisfied';
                        return (
                            <div
                                key={opt}
                                onClick={() => handleChange(validationField.name, opt)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: 8,
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    background: isSelected ? '#fb5c2c' : '#f5f5f5',
                                    color: isSelected ? '#fff' : '#666',
                                    transition: 'all 0.2s',
                                    border: isSelected ? 'none' : '1px solid #eee'
                                }}
                            >
                                {opt}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Status Icon
    const getStatusIcon = () => {
        if (calculatedStatus === 'Pass' || calculatedStatus === 'Completed') {
            return <CheckCircleFill style={{ fontSize: '24px', color: '#52c41a' }} />;
        }
        if (calculatedStatus === 'Fail') {
            return <CloseCircleFill style={{ fontSize: '24px', color: '#ff4d4f' }} />;
        }
        return <MinusOutline style={{ fontSize: '24px', color: '#d9d9d9' }} />;
    };

    return (
        <div style={{ borderBottom: '1px solid #f0f0f0', padding: '16px 0' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{node.name}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getStatusIcon()}
                    <div style={{
                        background: '#f0f0f0',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                    }}>
                        <DownOutline fontSize={12} color="#666" />
                    </div>
                </div>
            </div>

            {isOpen && (
                <div style={{ marginTop: 16 }}>
                    {/* Instruction */}
                    {instruction && (
                        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start' }}>
                            <span style={{
                                background: '#ffeeeb',
                                color: '#fb5c2c',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                marginRight: 8,
                                flexShrink: 0,
                                marginTop: 2
                            }}>
                                Instruction
                            </span>
                            <span style={{ fontSize: '0.9rem', color: '#333' }}>{instruction}</span>
                        </div>
                    )}

                    {/* Tip */}
                    {tip && (
                        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start' }}>
                            <span style={{
                                background: '#e6f7ff',
                                color: '#1890ff',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                marginRight: 8,
                                flexShrink: 0,
                                marginTop: 2
                            }}>
                                Tips
                            </span>
                            <span style={{ fontSize: '0.9rem', color: '#666' }}>{tip}</span>
                        </div>
                    )}

                    {renderPhotos()}
                    {renderTags()}
                    {renderValidation()}

                </div>
            )}
        </div>
    );
};

export default function InspectionForm({ nodes, initialResults = [], headerMetadata, projectId, instanceId }: Props) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Create map for easy lookup
    const resultMap = new Map(initialResults.map(r => [r.nodeTemplateId, r]));

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const result = await submitInspection(instanceId, projectId);
            if (result.success) {
                router.refresh();
            } else {
                console.error(result.error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    // Separate Header Node from Checklist Nodes
    const headerNode = nodes.find(n => n.name === "Room & Item Detail");
    const checklistNodes = nodes.filter(n => n.name !== "Room & Item Detail");

    const isSubmitted = headerMetadata?.status === "Submitted";

    // --- Header Persistence Logic ---
    const [headerValues, setHeaderValues] = useState<Record<string, any>>(() => {
        if (!headerNode) return {};
        const res = resultMap.get(headerNode.id);
        if (res?.value) {
            try { return JSON.parse(res.value); } catch { return {}; }
        }
        return {};
    });

    const headerSaveTimeout = React.useRef<NodeJS.Timeout | null>(null);
    const lastSavedHeader = React.useRef(JSON.stringify(headerValues));

    React.useEffect(() => {
        if (!headerNode) return;
        const currentStr = JSON.stringify(headerValues);
        if (currentStr === lastSavedHeader.current) return;

        if (headerSaveTimeout.current) clearTimeout(headerSaveTimeout.current);

        headerSaveTimeout.current = setTimeout(async () => {
            console.log("Saving header...", headerValues);
            await saveNodeResult(instanceId, headerNode.id, headerValues, "Completed");
            lastSavedHeader.current = currentStr;
        }, 1000);

        return () => {
            if (headerSaveTimeout.current) clearTimeout(headerSaveTimeout.current);
        };
    }, [headerValues, instanceId, headerNode]);
    // -------------------------------

    return (
        <div style={{ padding: '0px', background: 'var(--adm-color-background)', minHeight: '100%' }}>

            {/* Subject Information Card */}
            <div style={{
                padding: "16px",
                background: "#f5f5f5", // Light Gray Background
                borderRadius: "12px",
                marginBottom: "24px"
            }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginTop: 0, marginBottom: '12px', color: '#111' }}>
                    Subject Information
                </h2>
                {renderHeaderFields()}
            </div>

            {/* Checklist Section */}
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: '#fb5c2c', fontWeight: 700 }}>ITP Checklist</h3>
            <div style={{ marginBottom: "2rem" }}>
                {checklistNodes.map(node => (
                    <ChecklistCard
                        key={node.id}
                        node={node}
                        result={resultMap.get(node.id)}
                        instanceId={instanceId}
                    />
                ))}
            </div>

            {!isSubmitted && (
                <div style={{ marginTop: "2rem", paddingBottom: "3rem" }}>
                    <Button
                        block
                        color="primary"
                        size="large"
                        onClick={handleSubmit}
                        loading={submitting}
                        style={{
                            background: '#fb5c2c',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '18px',
                            height: '52px'
                        }}
                    >
                        Submit TIP
                    </Button>
                </div>
            )}
        </div>
    );

    function renderHeaderFields() {
        if (!headerNode) return null;
        let subFields: any[] = [];
        try {
            subFields = typeof headerNode.options === 'string' ? JSON.parse(headerNode.options) : [];
        } catch (e) { }

        const getField = (name: string) => subFields.find(f => f.name === name);
        const roomField = getField("Room Code");
        const itemField = getField("Item Code");
        const noticeField = getField("Notice");

        const renderMetadataInput = (field: any, placeholder: string) => {
            if (!field) return null;
            const val = headerValues[field.name];
            return (
                <div style={{
                    background: "#fff", // White input background
                    borderRadius: 8,
                    padding: "8px 12px",
                }}>
                    <div style={{ fontSize: "0.75rem", color: "#999", marginBottom: 4 }}>
                        {field.name}
                    </div>
                    <Input
                        style={{ '--font-size': '1rem' }}
                        placeholder={placeholder}
                        value={val || ""}
                        onChange={(v) => setHeaderValues(prev => ({ ...prev, [field.name]: v }))}
                    />
                </div>
            );
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {renderMetadataInput(roomField, "e.g. Bed 1")}
                    {renderMetadataInput(itemField, "e.g. W-08")}
                </div>
                {renderMetadataInput(noticeField, "e.g. AS2421 Sliding Door")}
            </div>
        );
    }
}

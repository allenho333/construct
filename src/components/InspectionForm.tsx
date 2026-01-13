"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { Form, Input, Selector, ImageUploader, Button, Card, Tag, Space } from 'antd-mobile';
import { ImageUploadItem } from 'antd-mobile/es/components/image-uploader';
import { CheckCircleFill, CloseCircleFill } from 'antd-mobile-icons';
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
                    // Only update if different to avoid loop/resetting WIP
                    if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
                        return parsed;
                    }
                    return prev;
                });
            } catch { }
        }
    }, [result?.value]);

    // Validated status calculated from local values (optimistic)
    // Or from saved result if values match (not really worth checking match, just recalc)
    // Actually, we should recalculate "isCompleted" based on current values.

    // Determine Status
    const isCompleted = React.useMemo(() => {
        if (fields.length === 0) return !!values["Value"]; // fallback for single input

        // 1. Validation is mandatory
        const validation = values["Validation"];
        if (!validation) return false;

        // 2. Check Photo (Required)
        const hasPhotoField = fields.some(f => f.inputType === 'photo');
        if (hasPhotoField) {
            const photoVal = values[fields.find(f => f.inputType === 'photo')?.name || ""];
            if (!photoVal || (Array.isArray(photoVal) && photoVal.length === 0)) return false;
        }

        // 3. Conditional: Dissatisfied reasons
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
        // Default to Completed if valid but no specific validation field (unlikely with this template)
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
            // Save
            console.log(`Saving node ${node.name}...`, values);
            await saveNodeResult(instanceId, node.id, values, calculatedStatus);
            lastSavedValues.current = currentValuesStr;
        }, 1000); // 1s debounce

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [values, calculatedStatus, instanceId, node.id, node.name]);


    // Mock upload function (hoisted for reuse)
    const mockUpload = async (file: File): Promise<ImageUploadItem> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    url: URL.createObjectURL(file), // Mock URL
                });
            }, 1000);
        });
    };

    const renderInput = (type: string, optionsStr: string | null | any[], label: string) => {
        let options: string[] = [];
        if (Array.isArray(optionsStr)) {
            if (typeof optionsStr[0] === 'string') options = optionsStr as string[];
        } else if (typeof optionsStr === 'string') {
            try { options = JSON.parse(optionsStr); } catch (e) { options = []; }
        }

        // Common onChange handler
        const handleChange = (val: any) => {
            setValues(prev => ({ ...prev, [label]: val }));
        };
        const value = values[label];

        if (type === 'text') {
            return (
                <Form.Item label={label}>
                    <Input
                        placeholder="Enter value"
                        value={value}
                        onChange={handleChange}
                    />
                </Form.Item>
            );
        }

        if (type === 'select' || type === 'multi_select') {
            // ... logic same ...
            // We need to handle selector value carefully
            const selValue = value ? (Array.isArray(value) ? value : [value]) : [];
            return (
                <Form.Item label={label}>
                    <Selector
                        options={options.map(opt => ({ label: opt, value: opt }))}
                        columns={2}
                        multiple={type === 'multi_select'}
                        value={selValue}
                        onChange={(v) => handleChange(type === 'multi_select' ? v : v[0])}
                    />
                </Form.Item>
            );
        }

        if (type === 'yes_no') {
            return (
                <Form.Item label={label}>
                    <Selector
                        options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
                        columns={2}
                        value={value ? [value] : []}
                        onChange={(v) => handleChange(v[0])}
                    />
                </Form.Item>
            );
        }

        if (type === 'photo') {
            return (
                <Form.Item label={label}>
                    <ImageUploader
                        upload={mockUpload}
                        maxCount={3}
                        value={value || []}
                        onChange={handleChange}
                    />
                </Form.Item>
            );
        }

        return null;
    };

    return (
        <Card style={{ marginBottom: 12, borderRadius: 8 }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{node.name}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Show status derived from local state if open/editing, or fallback to result */}
                    {calculatedStatus === 'Completed' && <Tag color='success'>Completed</Tag>}
                    {calculatedStatus === 'Pass' && <Tag color='success'>Pass</Tag>}
                    {calculatedStatus === 'Fail' && <Tag color='danger'>Fail</Tag>}
                    {calculatedStatus === 'Pending' && <Tag color='default'>Pending</Tag>}
                    <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '1.2rem', color: '#999' }}>
                        ▼
                    </span>
                </div>
            </div>

            {isOpen && (
                <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                    <p style={{ color: '#666', marginTop: 0, marginBottom: 16 }}>{node.description}</p>
                    <div className="input-area">
                        <Form layout='vertical'>
                            {node.inputType === 'form_group' ? (
                                fields.map((field, idx) => (
                                    <React.Fragment key={idx}>
                                        {renderInput(field.inputType, field.options, field.name)}
                                    </React.Fragment>
                                ))
                            ) : (
                                renderInput(node.inputType, node.options, "Value")
                            )}
                        </Form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default function InspectionForm({ nodes, initialResults = [], headerMetadata, projectId, instanceId }: Props) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Create map for easy lookup
    const resultMap = new Map(initialResults.map(r => [r.nodeTemplateId, r]));

    // Mock upload function
    const mockUpload = async (file: File): Promise<ImageUploadItem> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    url: URL.createObjectURL(file), // Mock URL
                });
            }, 1000);
        });
    };

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
        <div style={{ padding: '12px', background: 'var(--adm-color-background)', minHeight: '100%' }}>
            {/* Header Card */}
            <div style={{ padding: "16px", background: "var(--adm-color-box)", borderRadius: "8px", marginBottom: "16px" }}>
                <h2 style={{ fontSize: '1.2rem', marginTop: 0, marginBottom: '0.5rem' }}>
                    {headerMetadata?.itpNumber ? `ITP #${headerMetadata.itpNumber}` : "Pending Submission..."}
                </h2>

                {/* Custom Grid Layout for Header Fields */}
                {renderHeaderFields()}
            </div>

            {/* Checklist Section */}
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: 'var(--adm-color-text-secondary)' }}>Checklist</h3>
            {checklistNodes.map(node => (
                <ChecklistCard
                    key={node.id}
                    node={node}
                    result={resultMap.get(node.id)}
                    instanceId={instanceId}
                />
            ))}

            {!isSubmitted && (
                <div style={{ marginTop: "2rem", paddingBottom: "3rem" }}>
                    <Button
                        block
                        color="primary"
                        size="large"
                        onClick={handleSubmit}
                        loading={submitting}
                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    >
                        Submit Inspection
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
                <div style={{ background: "var(--adm-color-background)", borderRadius: 8, padding: "8px 12px", border: "1px solid var(--adm-color-border)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--adm-color-text-secondary)", marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {field.name}
                    </div>
                    <Input
                        style={{ '--font-size': '1rem', '--color': 'var(--adm-color-text)' }}
                        placeholder={placeholder}
                        value={val || ""}
                        onChange={(v) => setHeaderValues(prev => ({ ...prev, [field.name]: v }))}
                    />
                </div>
            );
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {renderMetadataInput(roomField, "e.g. 101")}
                    {renderMetadataInput(itemField, "e.g. W-01")}
                </div>
                {renderMetadataInput(noticeField, "Any special notes...")}
            </div>
        );
    }
}

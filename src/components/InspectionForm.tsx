"use client";

import React from 'react';
import { Form, Input, Selector, ImageUploader, Button, Card, Tag, Space } from 'antd-mobile';
import { ImageUploadItem } from 'antd-mobile/es/components/image-uploader';
import { CheckCircleFill, CloseCircleFill } from 'antd-mobile-icons';

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

type Props = {
    nodes: NodeTemplate[];
    initialResults?: NodeResult[];
};

export default function InspectionForm({ nodes, initialResults = [] }: Props) {
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

    const renderInput = (type: string, optionsStr: string | null | any[], label: string) => {
        let options: string[] = [];
        // handle if options is already an array (from recursion) or string
        if (Array.isArray(optionsStr)) {
            // If it's an array of strings
            if (typeof optionsStr[0] === 'string') options = optionsStr as string[];
        } else if (typeof optionsStr === 'string') {
            try {
                options = JSON.parse(optionsStr);
            } catch (e) {
                options = [];
            }
        }

        if (type === 'text') {
            return (
                <Form.Item label={label}>
                    <Input placeholder="Enter value" />
                </Form.Item>
            );
        }

        if (type === 'select') {
            return (
                <Form.Item label={label}>
                    <Selector
                        options={options.map(opt => ({ label: opt, value: opt }))}
                        columns={2}
                        multiple={false}
                    />
                </Form.Item>
            );
        }

        if (type === 'yes_no') {
            return (
                <Form.Item label={label}>
                    <Selector
                        options={[
                            { label: 'Yes', value: 'yes' },
                            { label: 'No', value: 'no' }
                        ]}
                        columns={2}
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
                    />
                </Form.Item>
            );
        }

        return null;
    };

    return (
        <div style={{ padding: '12px', background: '#f5f5f5', minHeight: '100%' }}>
            {nodes.map(node => {
                // Determine if we have a result
                const result = resultMap.get(node.id);
                const status = result?.status || "Pending";

                return (
                    <Card key={node.id} style={{ marginBottom: 12, borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{node.name}</h3>
                            {status === 'Pass' && <Tag color='success'>Pass</Tag>}
                            {status === 'Fail' && <Tag color='danger'>Fail</Tag>}
                            {status === 'Pending' && <Tag color='default'>Pending</Tag>}
                        </div>

                        <p style={{ color: '#666', marginTop: 0, marginBottom: 16 }}>{node.description}</p>

                        <div className="input-area">
                            <Form layout='vertical'>
                                {node.inputType === 'form_group' ? (
                                    // Parse options (which contain sub-nodes) and render them
                                    (() => {
                                        let subFields: any[] = [];
                                        try {
                                            subFields = typeof node.options === 'string' ? JSON.parse(node.options) : [];
                                        } catch (e) { }

                                        return subFields.map((field, idx) => (
                                            <React.Fragment key={idx}>
                                                {renderInput(field.inputType, field.options, field.name)}
                                            </React.Fragment>
                                        ));
                                    })()
                                ) : (
                                    renderInput(node.inputType, node.options, "Value")
                                )}
                            </Form>
                        </div>

                        {/* Actions */}
                        <div style={{ marginTop: 16, display: 'flex', gap: 12, borderTop: '1px solid #eee', paddingTop: 12 }}>
                            <Button block shape='rounded' color='success' size='small'>
                                <Space><CheckCircleFill /> Pass</Space>
                            </Button>
                            <Button block shape='rounded' color='danger' size='small'>
                                <Space><CloseCircleFill /> Fail</Space>
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { Button, CenterPopup, Form, Input, Toast } from 'antd-mobile';
import { AddCircleOutline } from 'antd-mobile-icons';
import { createProject } from "@/app/project-actions";

export default function CreateProjectButton() {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("location", values.location);
            formData.append("responsible", values.responsible);

            const result = await createProject(formData);

            if (result.success) {
                Toast.show({
                    icon: 'success',
                    content: 'Project created!',
                });
                setVisible(false);
                form.resetFields();
            } else {
                Toast.show({
                    icon: 'fail',
                    content: result.error || 'Failed to create project',
                });
            }
        } catch (e) {
            // Form validation failed or other error
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                color="primary"
                size="small"
                onClick={() => setVisible(true)}
                style={{ marginLeft: 'auto' }}
            >
                Create Project
            </Button>

            <CenterPopup
                visible={visible}
                onMaskClick={() => setVisible(false)}
                bodyStyle={{
                    width: '85vw',
                    maxWidth: '325px',
                    padding: '24px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--adm-color-box, #ffffff)',
                    color: 'var(--adm-color-text)',
                    margin: 'auto',
                }}
            >
                <h3 style={{ marginTop: 0, marginBottom: '16px', textAlign: 'center' }}>
                    New Project
                </h3>

                <Form
                    form={form}
                    layout='horizontal'
                    footer={
                        <Button block type='submit' color='primary' loading={loading} onClick={handleSubmit}>
                            Create
                        </Button>
                    }
                >
                    <Form.Item
                        name='name'
                        label='Name'
                        rules={[{ required: true, message: 'Project Name is required' }]}
                    >
                        <Input placeholder='Project Name' />
                    </Form.Item>
                    <Form.Item
                        name='location'
                        label='Location'
                    >
                        <Input placeholder='Address or Site' />
                    </Form.Item>
                    <Form.Item
                        name='responsible'
                        label='Manager'
                    >
                        <Input placeholder='Person in charge' />
                    </Form.Item>
                </Form>

                <div style={{ marginTop: '12px' }}>
                    <Button block fill='none' onClick={() => setVisible(false)}>
                        Cancel
                    </Button>
                </div>
            </CenterPopup>
        </>
    );
}

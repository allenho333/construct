"use client";

import React, { useState } from "react";
import { Form, Input, Button, Toast } from "antd-mobile";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { createProject } from "@/app/project-actions";
import { useRouter } from "next/navigation";
import styles from "../project.module.css";

export default function CreateProjectPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
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
                Toast.show({ icon: 'success', content: 'Project created!' });
                router.push("/"); // Redirect to Home/List
            } else {
                Toast.show({ icon: 'fail', content: result.error || 'Failed' });
            }
        } catch (e) {
            // Validation error
        } finally {
            setLoading(false);
        }
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
                <Link href="/project" style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#333',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '16px'
                }}>
                    <ChevronLeftIcon width={20} style={{ marginRight: '4px' }} />
                    Back
                </Link>
                <div style={{ flex: 1, textAlign: 'right' }}>
                    <img src="/logo.png" alt="Constructoo" style={{ height: '40px' }} />
                </div>
            </header>

            <h1 className={styles.headerTitle}>Create</h1>
            <p className={styles.subtitle} style={{ marginBottom: '32px' }}>
                Please create a new project
            </p>

            <Form layout="vertical" form={form} onFinish={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#111' }}>Project Name</label>
                    <Form.Item name="name" noStyle rules={[{ required: true, message: 'Required' }]}>
                        <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '12px' }}>
                            <Input placeholder="Type Project Name here..." style={{ fontSize: '16px', background: 'transparent' }} />
                        </div>
                    </Form.Item>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#111' }}>Address</label>
                    <Form.Item name="location" noStyle>
                        <div style={{ background: '#e0f2fe', borderRadius: '8px', padding: '12px', border: '1px solid #7dd3fc' }}>
                            <Input placeholder="Type Address here..." style={{ fontSize: '16px', background: 'transparent' }} />
                        </div>
                    </Form.Item>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#111' }}>Project Manager</label>
                    <Form.Item name="responsible" noStyle>
                        <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '12px' }}>
                            <Input placeholder="Type Manager Name here..." style={{ fontSize: '16px', background: 'transparent' }} />
                        </div>
                    </Form.Item>
                </div>

            </Form>

            <div className={styles.createButtonContainer}>
                <button className={styles.createButton} onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Project'}
                </button>
            </div>
        </div>
    );
}

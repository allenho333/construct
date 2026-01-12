"use client";

import React, { useActionState } from "react";
import { Form, Input, Button, Card, Toast } from "antd-mobile";
import { login } from "@/app/auth-actions";
import Link from "next/link";
import styles from "./login.module.css"; // We'll create a simple css module or inline styles

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null);

    if (state?.error) {
        Toast.show({
            content: state.error,
            icon: 'fail',
        })
    }

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Construct Login</h1>
            <Card>
                <Form
                    layout="horizontal"
                    footer={
                        <Button block type="submit" color="primary" size="large" loading={isPending}>
                            Log In
                        </Button>
                    }
                    onFinish={(values) => {
                        const formData = new FormData();
                        formData.append("username", values.username);
                        formData.append("password", values.password);
                        formAction(formData);
                    }}
                >
                    <Form.Header>Please log in to continue</Form.Header>
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: "Username is required" }]}
                    >
                        <Input placeholder="Enter username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: "Password is required" }]}
                    >
                        <Input placeholder="Enter password" type="password" />
                    </Form.Item>
                </Form>
            </Card>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                Don't have an account? <Link href="/register" style={{ color: 'var(--primary)' }}>Register</Link>
            </div>
        </div>
    );
}

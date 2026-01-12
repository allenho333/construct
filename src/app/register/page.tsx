"use client";

import React, { useActionState, startTransition } from "react";
import { Form, Input, Button, Card, Toast } from "antd-mobile";
import { register } from "@/app/auth-actions";
import Link from "next/link";

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(register, null);

    if (state?.error) {
        Toast.show({
            content: state.error,
            icon: 'fail',
        })
    }

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h1>
            <Card>
                <Form
                    layout="horizontal"
                    footer={
                        <Button block type="submit" color="primary" size="large" loading={isPending}>
                            Sign Up
                        </Button>
                    }
                    onFinish={(values) => {
                        const formData = new FormData();
                        formData.append("username", values.username);
                        formData.append("password", values.password);
                        formData.append("confirmPassword", values.confirmPassword);
                        formAction(formData);
                    }}
                >
                    <Form.Header>Create a new account</Form.Header>
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
                        <Input placeholder="Create password" type="password" />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Confirm"
                        rules={[{ required: true, message: "Please confirm password" }]}
                    >
                        <Input placeholder="Confirm password" type="password" />
                    </Form.Item>
                </Form>
            </Card>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                Already have an account? <Link href="/login" style={{ color: 'var(--primary)' }}>Log In</Link>
            </div>
        </div>
    );
}

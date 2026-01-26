"use client";

import React, { useActionState, startTransition } from "react";
import { Form, Input, Button } from "antd-mobile";
import { resetPassword } from "@/app/auth-actions";
import Link from "next/link";
import styles from "./reset-password.module.css";

export default function ResetPasswordPage() {
    const [state, formAction, isPending] = useActionState(resetPassword, null);

    return (
        <div className={styles.container}>
            <div className={styles.logoContainer}>
                <img src="/logo.png" alt="Constructoo" className={styles.logo} />
            </div>

            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>
                Remember your password? <Link href="/login" className={styles.link}>Sign in</Link>
            </p>

            {state?.error && (
                <div className={styles.errorMessage}>
                    {state.error}
                </div>
            )}

            <Form
                layout="vertical"
                onFinish={(values) => {
                    const formData = new FormData();
                    formData.append("phoneNumber", values.phoneNumber);
                    formData.append("email", values.email);
                    formData.append("password", values.password);
                    formData.append("confirmPassword", values.confirmPassword);
                    startTransition(() => {
                        formAction(formData);
                    });
                }}
            >
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <Form.Item
                        name="phoneNumber"
                        noStyle
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <div className={styles.inputWrapper}>
                            <Input placeholder="0434725663" clearable />
                        </div>
                    </Form.Item>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email</label>
                    <Form.Item
                        name="email"
                        noStyle
                        rules={[{ required: true, message: "Required", type: 'email' }]}
                    >
                        <div className={styles.inputWrapper}>
                            <Input placeholder="name@example.com" clearable />
                        </div>
                    </Form.Item>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>New Password</label>
                    <Form.Item
                        name="password"
                        noStyle
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <div className={styles.inputWrapper}>
                            <Input placeholder="•••••••••" type="password" clearable />
                        </div>
                    </Form.Item>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Confirm Password</label>
                    <Form.Item
                        name="confirmPassword"
                        noStyle
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <div className={styles.inputWrapper}>
                            <Input placeholder="•••••••••" type="password" clearable />
                        </div>
                    </Form.Item>
                </div>

                <Button
                    block
                    type="submit"
                    color="primary"
                    className={styles.submitButton}
                    loading={isPending}
                >
                    Reset Password
                </Button>
            </Form>
        </div>
    );
}

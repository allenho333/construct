"use client";

import React, { useActionState, startTransition } from "react";
import { Form, Input, Button, Card } from "antd-mobile";
import { login } from "@/app/auth-actions";
import Link from "next/link";
import styles from "./login.module.css"; // We'll create a simple css module or inline styles

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null);

    return (
        <div className={styles.container}>
            <div className={styles.logoContainer}>
                <img src="/logo.png" alt="Constructoo" className={styles.logo} />
            </div>

            <h1 className={styles.title}>Sign in</h1>
            <p className={styles.subtitle}>
                New customer? <Link href="/register" className={styles.link}>Create new account</Link>
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
                    formData.append("password", values.password);
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
                        rules={[{ required: true, message: "Phone number is required" }]}
                    >
                        <div className={styles.inputWrapper}>
                            <Input placeholder="0434725663" clearable />
                        </div>
                    </Form.Item>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Password</label>
                    <Form.Item
                        name="password"
                        noStyle
                        rules={[{ required: true, message: "Password is required" }]}
                    >
                        <div className={styles.inputWrapper}>
                            <Input placeholder="•••••••••" type="password" clearable onClear={() => { }} />
                            {/* Note: antd-mobile Input has built-in clearable/eye if configured, but default 'type=password' usually handles visibility toggle in some versions or needs custom icon. 
                                For simplicity with provided screenshot, we rely on standard behavior or we can add a custom toggle if needed. 
                                The screenshot shows an eye icon. antd-mobile Input specific props for password visibility might need check, 
                                but standard `type='password'` is a good start. 
                            */}
                        </div>
                    </Form.Item>
                    <div style={{ textAlign: "right", marginTop: "-12px", marginBottom: "8px" }}>
                        <Link href="/reset-password" style={{ color: "var(--adm-color-text-secondary, #666)", fontSize: "14px", textDecoration: "none" }}>
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <Button
                    block
                    type="submit"
                    color="primary"
                    className={styles.submitButton}
                    loading={isPending}
                >
                    Sign in
                </Button>
            </Form>

            <div className={styles.bottomSection}>
                <div className={styles.sloganContainer}>
                    <img src="/slogan.png" alt="Everyone can Verify" className={styles.slogan} />
                </div>
                <div className={styles.mascotContainer}>
                    <img src="/mascot.png" alt="Mascot" className={styles.mascot} />
                </div>
            </div>
        </div>
    );
}

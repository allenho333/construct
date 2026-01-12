"use client";

import { logout } from "@/app/auth-actions";
import { Button } from "antd-mobile";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function LogoutButton({ minimal = false }: { minimal?: boolean }) {
    const handleLogout = async () => {
        await logout();
    };

    if (minimal) {
        return (
            <button
                onClick={handleLogout}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--danger)',
                    fontSize: '0.9rem'
                }}
                title="Log Out"
            >
                <ArrowRightOnRectangleIcon width={20} />
                <span>Log Out</span>
            </button>
        )
    }

    return (
        <Button
            onClick={handleLogout}
            color="danger"
            fill="none"
            size="small"
            style={{ padding: '0 8px' }}
        >
            Log Out
        </Button>
    );
}

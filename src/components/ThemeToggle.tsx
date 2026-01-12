"use client";

import { useTheme } from "./ThemeProvider";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                background: "var(--secondary)",
                border: "none",
                borderRadius: "50%",
                padding: "8px",
                cursor: "pointer",
                color: "var(--foreground)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
            aria-label="Toggle Theme"
        >
            {theme === "light" ? (
                <MoonIcon width={20} />
            ) : (
                <SunIcon width={20} />
            )}
        </button>
    );
}

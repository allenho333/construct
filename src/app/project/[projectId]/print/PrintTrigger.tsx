"use client";

import { useEffect } from "react";

export default function PrintTrigger() {
    useEffect(() => {
        // Delay slightly to ensure styles load
        const timer = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return null;
}

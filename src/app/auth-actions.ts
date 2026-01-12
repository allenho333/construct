"use server";

import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function login(prevState: any, formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { error: "Please provide both username and password." };
    }

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        return { error: "Invalid credentials." };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return { error: "Invalid credentials." };
    }

    await createSession(user.id);
    redirect("/");
}

export async function register(prevState: any, formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!username || !password || !confirmPassword) {
        return { error: "Please fill in all fields." };
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { username },
    });

    if (existingUser) {
        return { error: "Username already taken." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
        },
    });

    await createSession(user.id);
    redirect("/");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}

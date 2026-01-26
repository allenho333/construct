"use server";

import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function login(prevState: any, formData: FormData) {
    const phoneNumber = formData.get("phoneNumber") as string;
    const password = formData.get("password") as string;

    if (!phoneNumber || !password) {
        console.log("Login failed: Missing fields", { phoneNumber: !!phoneNumber, password: !!password });
        return { error: "Please provide both phone number and password." };
    }

    console.log("Attempting login for:", phoneNumber);

    const user = await prisma.user.findUnique({
        where: { phoneNumber },
    });

    console.log("User found:", !!user);

    if (!user) {
        return { error: "Invalid credentials." };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
        return { error: "Invalid credentials." };
    }

    await createSession(user.id);

    // Smart Redirect DISABLED: Always go to project list (Home) as per new requirement.
    redirect("/project");
}

export async function register(prevState: any, formData: FormData) {
    const phoneNumber = formData.get("phoneNumber") as string;
    const password = formData.get("password") as string;
    const email = formData.get("email") as string;

    if (!phoneNumber || !password) {
        return { error: "Please fill in all required fields." };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { phoneNumber },
    });

    if (existingUser) {
        return { error: "Phone number already registered." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            phoneNumber,
            password: hashedPassword,
            email: email || undefined,
        },
    });

    // Do not auto-login. Redirect to login page.
    redirect("/login");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}

export async function resetPassword(prevState: any, formData: FormData) {
    const phoneNumber = formData.get("phoneNumber") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!phoneNumber || !email || !password || !confirmPassword) {
        return { error: "Please fill in all fields." };
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    // Find user
    const user = await prisma.user.findUnique({
        where: { phoneNumber },
    });

    if (!user) {
        return { error: "User not found." };
    }

    // specific check: verify email matches
    if (user.email !== email) {
        return { error: "Email does not match our records." };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });

    redirect("/login");
}

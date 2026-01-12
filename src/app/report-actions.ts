"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import nodemailer from "nodemailer";

// Mock transport for development/demo
// In production, replace with real credentials or a service like Resend/SendGrid
const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email", // Placeholder
    port: 587,
    secure: false,
    auth: {
        user: "ethereal_user",
        pass: "ethereal_pass",
    },
});

export async function sendProjectReport(projectId: string, email: string) {
    const session = await getSession();
    if (!session || !session.userId) {
        return { error: "Unauthorized" };
    }

    // 1. Update User Email
    await prisma.user.update({
        where: { id: session.userId },
        data: { email },
    });

    // 2. Fetch Project Data
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            inspectionInstances: {
                include: {
                    inspectionType: true,
                    nodeResults: true
                }
            }
        }
    });

    if (!project) {
        return { error: "Project not found" };
    }

    // 3. Generate Report (HTML for now)
    let html = `<h1>Project Report: ${project.name}</h1>`;
    html += `<p><strong>Location:</strong> ${project.location}</p>`;
    html += `<p><strong>Responsible:</strong> ${project.responsible}</p>`;
    html += `<h2>Inspections</h2><ul>`;

    project.inspectionInstances.forEach((inst: any) => {
        html += `<li><strong>${inst.inspectionType.name}</strong> (${inst.status}) - ${inst.itpNumber || 'No ITP'}</li>`;
    });
    html += `</ul>`;

    // 4. Send Email
    try {
        // For demo purposes, we'll log the email content instead of failing on invalid credentials
        console.log("---------------------------------------------------");
        console.log(`[MOCK EMAIL] Sending report to: ${email}`);
        console.log(`Subject: Project Report - ${project.name}`);
        console.log("Content Preview:", html.substring(0, 100) + "...");
        console.log("---------------------------------------------------");

        // Attempt actual send if configured (it will fail with placeholder creds but catching error)
        // await transporter.sendMail({
        //   from: '"Construct App" <no-reply@construct.app>',
        //   to: email,
        //   subject: `Project Report: ${project.name}`,
        //   html: html,
        // });

        // Note: We are returning success here because we are "Mocking" the success for the user demo
        return { success: true, message: `Report sent to ${email} (Check server logs for mock output)` };
    } catch (error) {
        console.error("Email send failed:", error);
        return { error: "Failed to send email" };
    }
}

export async function getUserEmail() {
    const session = await getSession();
    if (!session || !session.userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { email: true }
    });
    return user?.email || "";
}

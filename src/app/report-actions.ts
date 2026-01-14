"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import nodemailer from "nodemailer";

// Configure transporter based on environment variables
const smtpConfig = {
    host: process.env.SMTP_HOST || "smtp.ethereal.email", // Default to mock if not set
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || "ethereal_user",
        pass: process.env.SMTP_PASS || "ethereal_pass",
    },
};

const transporter = nodemailer.createTransport(smtpConfig);

// Helper to check if we are using real credentials
const isRealEmail = process.env.SMTP_HOST && process.env.SMTP_USER;

export async function sendProjectReport(projectId: string, email: string, instanceId?: string) {
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
    const reportTitle = instanceId ? `Inspection Report` : `Project Report`;
    let html = `<h1>${reportTitle}: ${project.name}</h1>`;
    html += `<p><strong>Location:</strong> ${project.location}</p>`;
    html += `<p><strong>Responsible:</strong> ${project.responsible}</p>`;
    html += `<h2>Inspections</h2><ul>`;

    project.inspectionInstances
        .filter((inst: any) => !instanceId || inst.id === instanceId)
        .forEach((inst: any) => {
            html += `<li><strong>${inst.inspectionType.name}</strong> (${inst.status}) - ${inst.itpNumber || 'No ITP'}</li>`;
        });
    html += `</ul>`;

    // 4. Send Email
    try {
        if (isRealEmail) {
            console.log(`Sending real email to ${email} via ${process.env.SMTP_HOST}...`);
            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Construct App" <no-reply@construct.app>',
                to: email,
                subject: `${reportTitle}: ${project.name}`,
                html: html,
            });
            return { success: true, message: `Report sent to ${email}` };
        } else {
            // Mock Mode
            console.log("---------------------------------------------------");
            console.log(`[MOCK EMAIL] Sending report to: ${email}`);
            console.log(`Subject: ${reportTitle} - ${project.name}`);
            console.log("Content Preview:", html.substring(0, 100) + "...");
            console.log("---------------------------------------------------");
            return { success: true, message: `Report sent to ${email} (Check server logs for mock output)` };
        }
    } catch (error) {
        console.error("Email send failed:", error);
        return { error: "Failed to send email" };
    }
}

export async function getUserEmail() {
    console.log("getUserEmail called");
    const session = await getSession();
    if (!session || !session.userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { email: true }
    });
    return user?.email || "";
}

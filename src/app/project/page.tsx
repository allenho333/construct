import { prisma } from "@/lib/prisma";
import ProjectListClient from "./ProjectListClient";

export const dynamic = "force-dynamic";

export default async function ProjectListPage() {
    const projects = await prisma.project.findMany();

    return <ProjectListClient projects={projects} />;
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";

import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await prisma.project.findMany();

  return (
    <div style={{ padding: "2rem" }}>
      <main>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h1>Construction Project Manager</h1>
          <ThemeToggle />
        </div>
        <p>Select a project to get started.</p>

        <div style={{ marginTop: "2rem" }}>
          <h2>Projects</h2>
          {projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {projects.map((project) => (
                <li key={project.id} style={{ margin: "1rem 0", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                  <Link href={`/project/${project.id}`}>
                    <h3 style={{ marginBottom: "0.5rem" }}>{project.name}</h3>
                    <p style={{ color: "#666" }}>{project.location}</p>
                    <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                      Responsbile: {project.responsible}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

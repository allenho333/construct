import { prisma } from "@/lib/prisma";
import Link from "next/link";

import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import ReportActions from "@/components/ReportActions";

import CreateProjectButton from "@/components/CreateProjectButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await prisma.project.findMany();

  return (
    <div style={{ padding: "2rem" }}>
      <main>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h1>Construction Project Manager</h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <LogoutButton />
            <ThemeToggle />
          </div>
        </div>
        <p>Select a project to get started.</p>

        <div style={{ marginTop: "2rem" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "1rem" }}>
            <h2 style={{ margin: 0 }}>Projects</h2>
            <CreateProjectButton />
          </div>
          {projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {projects.map((project) => (
                <li key={project.id} style={{ margin: "1rem 0", padding: "1rem", border: "1px solid var(--adm-color-border)", borderRadius: "8px", background: 'var(--adm-color-box)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link href={`/project/${project.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                    <div style={{ marginBottom: "0.5rem", fontSize: '1.17em', fontWeight: 'bold', color: 'var(--adm-color-text)' }}>
                      {project.code && <span style={{ opacity: 0.7, marginRight: '8px' }}>{project.code}</span>}
                      {project.name}
                    </div>
                    <p style={{ margin: 0, color: "var(--adm-color-text-secondary)", opacity: 0.8 }}>{project.location}</p>
                    <p style={{ margin: 0, fontSize: "0.8rem", marginTop: "0.5rem", color: "var(--adm-color-text-secondary)" }}>
                      Responsible: {project.responsible}
                    </p>
                  </Link>
                  <div style={{ marginLeft: '1rem' }}>
                    <ReportActions projectId={project.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

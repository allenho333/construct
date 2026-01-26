import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { logout } from "@/app/auth-actions";
import styles from "./project.module.css";
// Note: imports for components like LogoutButton, themeToggle etc are not in use in the new design snippet I copied, 
// but 'logout' action is used.

export const dynamic = "force-dynamic";

export default async function ProjectListPage() {
    const projects = await prisma.project.findMany();

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className="mobile-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0px',
                background: '#fff',
                height: '56px',
                marginBottom: '20px'
            }}>
                <form action={logout}>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#333',
                        background: 'none',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}>
                        <ChevronLeftIcon width={20} style={{ marginRight: '4px' }} />
                        Log Out
                    </button>
                </form>
                <div style={{ flex: 1, textAlign: 'right' }}>
                    <img src="/logo.png" alt="Constructoo" style={{ height: '40px' }} />
                </div>
            </header>

            <h1 className={styles.headerTitle}>Certifying Passer</h1>
            <p className={styles.subtitle} style={{ marginBottom: '32px' }}>
                Select or create a project to get started.
            </p>

            <div className={styles.subHeader} style={{ alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>My projects</h2>
                <Link href="/project/create" className={styles.createButton} style={{ width: 'auto', height: '36px', fontSize: '14px', padding: '0 16px', textDecoration: 'none' }}>
                    Create Project
                </Link>
            </div>

            <div className={styles.inspectionList}>
                {projects.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>No projects found.</p>
                ) : (
                    projects.map((project) => (
                        <Link href={`/project/${project.id}/inspection`} key={project.id} className={styles.card}>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{project.name}</h3>
                                <p className={styles.cardDetail}>{project.location}</p>
                                <p className={styles.cardDetail} style={{ marginTop: '8px' }}>Manager: {project.responsible}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

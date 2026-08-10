"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NewProjectModal } from "@/components/NewProjectModal";

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (!mounted) return;
      if (res.ok) setProjects(await res.json());
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-3xl font-bold">Projects</h1>
        <button onClick={() => setModalOpen(true)} className="bg-amber text-ink font-medium px-4 py-2 rounded-lg hover:opacity-90 transition">
          New project
        </button>
      </div>

      <div className="space-y-3">
        {!loading && projects.length === 0 && (
          <p className="text-muted text-center py-16">No projects yet. Create one to start tracking bugs.</p>
        )}

        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/${project.id}`}
            className="flex items-center justify-between bg-surface border border-hairline rounded-xl px-6 py-5 hover:border-amber/50 transition"
          >
            <div>
              <h2 className="font-display font-bold text-lg">{project.name}</h2>
              <p className="text-muted text-sm font-mono mt-1">{project.recordCount} records · {project.verifiedCount} verified</p>
            </div>
          </Link>
        ))}
      </div>

      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={(id) => {
        setModalOpen(false);
        // Refresh list
        fetch("/api/projects").then((r) => {
          if (!r.ok) return;
          return r.json().then((d) => setProjects(d));
        });
      }} />
    </main>
  );
}

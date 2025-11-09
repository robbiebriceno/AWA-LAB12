"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Author = {
  id: string;
  name: string;
  email: string;
  nationality?: string | null;
  birthYear?: number | null;
  _count?: { books: number };
};

export default function Dashboard() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    nationality: "",
    birthYear: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ totalAuthors: number; totalBooks: number; averagePages: number; genres: string[] } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; email: string; nationality: string; birthYear: string }>({ name: "", email: "", nationality: "", birthYear: "" });

  async function loadAuthors() {
    setLoading(true);
    try {
      const res = await fetch("/api/authors");
      let data: any = null;
      try {
        data = await res.json();
      } catch (_e) {}
      if (!res.ok || !Array.isArray(data)) {
        setError("No se pudieron cargar autores");
        setAuthors([]);
      } else {
        setAuthors(data);
      }
    } catch (e) {
      console.error(e);
      setError("Error de red al cargar autores");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) return;
      const s = await res.json();
      if (
        s &&
        typeof s.totalAuthors === "number" &&
        typeof s.totalBooks === "number" &&
        typeof s.averagePages === "number"
      ) {
        setStats({
          totalAuthors: s.totalAuthors,
          totalBooks: s.totalBooks,
          averagePages: s.averagePages,
          genres: Array.isArray(s.genres) ? s.genres : [],
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadAuthors();
    loadStats();
  }, []);

  async function createAuthor(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          nationality: form.nationality || undefined,
          birthYear: form.birthYear ? parseInt(form.birthYear, 10) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear autor");
      } else {
        setForm({ name: "", email: "", nationality: "", birthYear: "" });
        loadAuthors();
      }
    } catch (e) {
      setError("Error inesperado");
    }
  }

  async function deleteAuthor(id: string) {
    if (!confirm("Eliminar autor?")) return;
    try {
      const res = await fetch(`/api/authors/${id}`, { method: "DELETE" });
      if (res.ok) loadAuthors();
    } catch (e) {
      console.error(e);
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const res = await fetch(`/api/authors/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        email: editForm.email,
        nationality: editForm.nationality || undefined,
        birthYear: editForm.birthYear ? parseInt(editForm.birthYear, 10) : undefined,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      loadAuthors();
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Biblioteca</h1>

      <section className="mb-8 max-w-xl">
        <h2 className="font-semibold mb-2">Crear Autor</h2>
        <form onSubmit={createAuthor} className="space-y-2">
          <input
            required
            placeholder="Nombre"
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
            <input
            placeholder="Nacionalidad"
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={form.nationality}
            onChange={(e) => setForm({ ...form, nationality: e.target.value })}
          />
          <input
            placeholder="Año nacimiento"
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={form.birthYear}
            onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
          >
            Guardar
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </section>

      {stats && (
        <section className="mb-8 max-w-xl bg-white dark:bg-zinc-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Estadísticas Generales</h2>
          <ul className="text-sm space-y-1">
            <li>Total autores: {stats.totalAuthors}</li>
            <li>Total libros: {stats.totalBooks}</li>
            <li>Promedio páginas: {stats.averagePages}</li>
            <li>Géneros: {stats.genres.join(", ") || "-"}</li>
          </ul>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Autores ({authors.length})</h2>
          <Link
            href="/books"
            className="text-sm underline hover:text-blue-600"
          >
            Buscar Libros
          </Link>
        </div>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <ul className="space-y-2">
            {authors.map((a) => (
              <li key={a.id} className="rounded border p-2 bg-white dark:bg-zinc-800 space-y-2">
                {editingId === a.id ? (
                  <form onSubmit={saveEdit} className="space-y-2 text-sm">
                    <input
                      className="w-full rounded border px-2 py-1"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                    <input
                      type="email"
                      className="w-full rounded border px-2 py-1"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                    <input
                      className="w-full rounded border px-2 py-1"
                      placeholder="Nacionalidad"
                      value={editForm.nationality}
                      onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                    />
                    <input
                      className="w-full rounded border px-2 py-1"
                      placeholder="Año nacimiento"
                      value={editForm.birthYear}
                      onChange={(e) => setEditForm({ ...editForm, birthYear: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button className="px-2 py-1 rounded bg-blue-600 text-white">Guardar</button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 rounded bg-zinc-300 dark:bg-zinc-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-zinc-500">{a.email}</p>
                      <p className="text-xs text-zinc-500">Libros: {a._count?.books ?? 0}</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <Link
                        href={`/authors/${a.id}`}
                        className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => {
                          setEditingId(a.id);
                          setEditForm({
                            name: a.name,
                            email: a.email,
                            nationality: a.nationality || "",
                            birthYear: a.birthYear ? String(a.birthYear) : "",
                          });
                        }}
                        className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteAuthor(a.id)}
                        className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

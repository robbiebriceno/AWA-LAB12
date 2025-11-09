"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AuthorDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const [author, setAuthor] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", bio: "", nationality: "", birthYear: "" });
  const [newBook, setNewBook] = useState({ title: "", isbn: "", publishedYear: "", genre: "", pages: "" });

  async function loadAll() {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([
        fetch(`/api/authors/${id}`),
        fetch(`/api/authors/${id}/stats`),
      ]);
      let a: any = null;
      let s: any = null;
      try { a = await aRes.json(); } catch (_e) {}
      try { s = await sRes.json(); } catch (_e) {}
      if (aRes.ok && a && a.id) {
        setAuthor(a);
        setForm({
          name: a.name || "",
          email: a.email || "",
          bio: a.bio || "",
          nationality: a.nationality || "",
          birthYear: a.birthYear ? String(a.birthYear) : "",
        });
      } else {
        setAuthor(null);
      }
      if (
        sRes.ok &&
        s &&
        typeof s.totalBooks === "number" &&
        Array.isArray(s.genres)
      ) {
        setStats(s);
      } else {
        setStats(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadAll();
  }, [id]);

  async function updateAuthor(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/authors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        bio: form.bio || undefined,
        nationality: form.nationality || undefined,
        birthYear: form.birthYear ? parseInt(form.birthYear, 10) : undefined,
      }),
    });
    if (res.ok) loadAll();
  }

  async function addBook(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newBook.title,
        isbn: newBook.isbn,
        publishedYear: newBook.publishedYear ? parseInt(newBook.publishedYear, 10) : undefined,
        genre: newBook.genre || undefined,
        pages: newBook.pages ? parseInt(newBook.pages, 10) : undefined,
        authorId: id,
      }),
    });
    if (res.ok) {
      setNewBook({ title: "", isbn: "", publishedYear: "", genre: "", pages: "" });
      loadAll();
    }
  }

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!author) return <div className="p-6">Autor no encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{author.name}</h1>
      <p className="text-sm text-zinc-500">{author.email}</p>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2 bg-white dark:bg-zinc-800 p-4 rounded">
          <h2 className="font-semibold">Editar Autor</h2>
          <form onSubmit={updateAuthor} className="space-y-2">
            <input className="w-full rounded border px-2 py-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input type="email" className="w-full rounded border px-2 py-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="w-full rounded border px-2 py-1" placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <input className="w-full rounded border px-2 py-1" placeholder="Nacionalidad" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
            <input className="w-full rounded border px-2 py-1" placeholder="Año nacimiento" value={form.birthYear} onChange={(e) => setForm({ ...form, birthYear: e.target.value })} />
            <button className="rounded bg-blue-600 px-3 py-1 text-white">Guardar</button>
          </form>
        </div>
        <div className="space-y-2 bg-white dark:bg-zinc-800 p-4 rounded">
          <h2 className="font-semibold">Estadísticas</h2>
          {stats ? (
            <div className="text-sm">
              <p>Total libros: {stats.totalBooks}</p>
              <p>Primer libro: {stats.firstBook ? `${stats.firstBook.title} (${stats.firstBook.year})` : "-"}</p>
              <p>Último libro: {stats.latestBook ? `${stats.latestBook.title} (${stats.latestBook.year})` : "-"}</p>
              <p>Promedio páginas: {stats.averagePages}</p>
              <p>Géneros: {stats.genres?.join(", ")}</p>
              <p>Más largo: {stats.longestBook ? `${stats.longestBook.title} (${stats.longestBook.pages})` : "-"}</p>
              <p>Más corto: {stats.shortestBook ? `${stats.shortestBook.title} (${stats.shortestBook.pages})` : "-"}</p>
            </div>
          ) : (
            <p>Sin estadísticas</p>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Libros</h2>
        <ul className="grid md:grid-cols-2 gap-2">
          {author.books?.map((b: any) => (
            <li key={b.id} className="rounded border p-2 bg-white dark:bg-zinc-800">
              <p className="font-medium">{b.title}</p>
              <p className="text-xs text-zinc-500">{b.publishedYear ?? "-"} • {b.genre ?? ""}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 bg-white dark:bg-zinc-800 p-4 rounded max-w-lg">
        <h2 className="font-semibold">Agregar Libro</h2>
        <form onSubmit={addBook} className="space-y-2">
          <input required placeholder="Título" className="w-full rounded border px-2 py-1" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} />
          <input required placeholder="ISBN" className="w-full rounded border px-2 py-1" value={newBook.isbn} onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Año" className="w-full rounded border px-2 py-1" value={newBook.publishedYear} onChange={(e) => setNewBook({ ...newBook, publishedYear: e.target.value })} />
            <input placeholder="Páginas" className="w-full rounded border px-2 py-1" value={newBook.pages} onChange={(e) => setNewBook({ ...newBook, pages: e.target.value })} />
          </div>
          <input placeholder="Género" className="w-full rounded border px-2 py-1" value={newBook.genre} onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })} />
          <button className="rounded bg-blue-600 px-3 py-1 text-white">Agregar</button>
        </form>
      </section>
    </div>
  );
}

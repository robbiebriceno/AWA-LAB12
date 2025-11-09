"use client";
import { useEffect, useMemo, useState } from "react";

type Author = { id: string; name: string };

type Book = {
  id: string;
  title: string;
  description?: string | null;
  isbn?: string | null;
  publishedYear?: number | null;
  genre?: string | null;
  pages?: number | null;
  authorId: string;
  author?: { id: string; name: string };
};

const SORT_FIELDS = [
  { value: "createdAt", label: "Fecha de creación" },
  { value: "title", label: "Título" },
  { value: "publishedYear", label: "Año de publicación" },
] as const;

export default function BooksPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    isbn: "",
    publishedYear: "",
    genre: "",
    pages: "",
    authorId: "",
  });

  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    authorId: "",
    authorName: "",
    sortBy: "createdAt",
    order: "desc",
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  );

  async function loadAuthors() {
    const res = await fetch("/api/authors");
    let data: any = null;
    try {
      data = await res.json();
    } catch (_e) {}
    if (res.ok && Array.isArray(data)) {
      setAuthors(data.map((a: any) => ({ id: a.id, name: a.name })));
    } else {
      setAuthors([]);
    }
  }

  async function loadGenres() {
    // Obtener géneros únicos desde el endpoint de estadísticas
    const res = await fetch("/api/stats");
    if (res.ok) {
      const stats = await res.json();
      setGenres(Array.isArray(stats.genres) ? (stats.genres as string[]) : []);
    }
  }

  async function searchBooks() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.genre) params.set("genre", filters.genre);
      if (filters.authorName) params.set("authorName", filters.authorName);
      if (filters.authorId) params.set("authorId", filters.authorId);
      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("sortBy", filters.sortBy);
      params.set("order", filters.order);

      const res = await fetch(`/api/books/search?${params.toString()}`);
      let json: any = null;
      try {
        json = await res.json();
      } catch (_e) {}
      if (
        res.ok &&
        json &&
        Array.isArray(json.data) &&
        json.pagination &&
        typeof json.pagination.total === "number"
      ) {
        setBooks(json.data);
        setTotal(json.pagination.total);
      } else {
        setBooks([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAuthors();
    loadGenres();
  }, []);

  useEffect(() => {
    searchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters.sortBy, filters.order]);

  // Búsqueda en tiempo real con debounce al cambiar filtros principales
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      searchBooks();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.genre, filters.authorName, filters.authorId]);

  function onSubmitSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    searchBooks();
  }

  async function createBook(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          isbn: form.isbn,
          publishedYear: form.publishedYear
            ? parseInt(form.publishedYear, 10)
            : undefined,
          genre: form.genre || undefined,
          pages: form.pages ? parseInt(form.pages, 10) : undefined,
          authorId: form.authorId,
        }),
      });
      if (res.ok) {
        setForm({
          title: "",
          description: "",
          isbn: "",
          publishedYear: "",
          genre: "",
          pages: "",
          authorId: "",
        });
        searchBooks();
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6 min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
      <h1 className="text-2xl font-bold mb-4">Búsqueda de Libros</h1>

      <section className="grid md:grid-cols-2 gap-6 mb-8">
        <form onSubmit={createBook} className="space-y-2 bg-white dark:bg-zinc-800 p-4 rounded">
          <h2 className="font-semibold mb-1">Crear Libro</h2>
          <input
            required
            placeholder="Título"
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            required
            placeholder="ISBN"
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
          />
          <textarea
            placeholder="Descripción"
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Año"
              className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
              value={form.publishedYear}
              onChange={(e) => setForm({ ...form, publishedYear: e.target.value })}
            />
            <input
              placeholder="Páginas"
              className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
              value={form.pages}
              onChange={(e) => setForm({ ...form, pages: e.target.value })}
            />
          </div>
          <input
            placeholder="Género"
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
            list="genre-list"
          />
          <datalist id="genre-list">
            {genres.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
          <select
            required
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={form.authorId}
            onChange={(e) => setForm({ ...form, authorId: e.target.value })}
          >
            <option value="">Seleccione autor</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button
            disabled={creating}
            className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
          >
            {creating ? "Creando..." : "Crear"}
          </button>
        </form>

        <form onSubmit={onSubmitSearch} className="space-y-2 bg-white dark:bg-zinc-800 p-4 rounded">
          <h2 className="font-semibold mb-1">Buscar y Filtrar</h2>
          <input
            placeholder="Buscar por título"
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <input
            placeholder="Autor (por nombre)"
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={filters.authorName}
            onChange={(e) => setFilters({ ...filters, authorName: e.target.value })}
          />
          <select
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={filters.authorId}
            onChange={(e) => setFilters({ ...filters, authorId: e.target.value })}
          >
            <option value="">Todos los autores</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          >
            <option value="">Todos los géneros</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              {SORT_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
              value={filters.order}
              onChange={(e) => setFilters({ ...filters, order: e.target.value })}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="w-full rounded border px-2 py-1 bg-white dark:bg-zinc-800"
            >
              {[10, 20, 30, 40, 50].map((n) => (
                <option key={n} value={n}>
                  {n} por página
                </option>
              ))}
            </select>
            <button className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
              Buscar
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Resultados ({total})</h2>
        </div>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <ul className="grid md:grid-cols-2 gap-2">
            {books.map((b) => (
              <EditableBookItem key={b.id} book={b} onChanged={searchBooks} />
            ))}
          </ul>
        )}
        <div className="flex items-center gap-2 mt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 rounded border disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 rounded border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}

function EditableBookItem({ book, onChanged }: { book: Book; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: book.title,
    publishedYear: book.publishedYear ? String(book.publishedYear) : "",
    pages: book.pages ? String(book.pages) : "",
    genre: book.genre || "",
  });

  async function save() {
    const res = await fetch(`/api/books/${book.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        publishedYear: form.publishedYear ? parseInt(form.publishedYear, 10) : undefined,
        pages: form.pages ? parseInt(form.pages, 10) : undefined,
        genre: form.genre || undefined,
      }),
    });
    if (res.ok) {
      setEditing(false);
      onChanged();
    }
  }

  return (
    <li className="rounded border p-2 bg-white dark:bg-zinc-800">
      {editing ? (
        <div className="space-y-2 text-sm">
          <input className="w-full rounded border px-2 py-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="w-full rounded border px-2 py-1" placeholder="Año" value={form.publishedYear} onChange={(e) => setForm({ ...form, publishedYear: e.target.value })} />
            <input className="w-full rounded border px-2 py-1" placeholder="Páginas" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
          </div>
          <input className="w-full rounded border px-2 py-1" placeholder="Género" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={save} className="px-2 py-1 rounded bg-blue-600 text-white">Guardar</button>
            <button onClick={() => setEditing(false)} className="px-2 py-1 rounded bg-zinc-300 dark:bg-zinc-700">Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          <p className="font-medium">{book.title}</p>
          <p className="text-xs text-zinc-500">
            {book.author?.name} {book.publishedYear ? `• ${book.publishedYear}` : ""}
          </p>
          <p className="text-xs text-zinc-500">{book.genre}</p>
          <div className="mt-2 flex gap-2 text-sm">
            <button
              onClick={() => setEditing(true)}
              className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Editar
            </button>
            <button
              onClick={async () => {
                const ok = confirm("Eliminar libro?");
                if (!ok) return;
                const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
                if (res.ok) onChanged();
              }}
              className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </>
      )}
    </li>
  );
}

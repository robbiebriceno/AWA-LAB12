import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const author = await prisma.author.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!author) {
      return NextResponse.json({ error: "Autor no encontrado" }, { status: 404 });
    }

    const books = await prisma.book.findMany({
      where: { authorId: id },
      orderBy: { publishedYear: "asc" },
    });

    const totalBooks = books.length;

    // Derivados
    let firstBook: { title: string; year: number | null } | null = null;
    let latestBook: { title: string; year: number | null } | null = null;

    const withYearAsc = books.filter((b) => b.publishedYear != null) as Array<{
      id: string;
      title: string;
      publishedYear: number;
      pages: number | null;
      genre: string | null;
    }>;

    if (withYearAsc.length > 0) {
      const first = withYearAsc[0];
      firstBook = { title: first.title, year: first.publishedYear };
      const last = withYearAsc[withYearAsc.length - 1];
      latestBook = { title: last.title, year: last.publishedYear };
    }

    const pagesValues = books
      .map((b) => (typeof b.pages === "number" ? b.pages : null))
      .filter((v): v is number => v !== null);

    const averagePages = pagesValues.length
      ? Math.round(pagesValues.reduce((a, b) => a + b, 0) / pagesValues.length)
      : 0;

    const genres = Array.from(
      new Set(
        books
          .map((b) => (b.genre ? b.genre.trim() : null))
          .filter((g): g is string => !!g),
      ),
    );

    // Longest/Shortest by pages
    let longestBook: { title: string; pages: number } | null = null;
    let shortestBook: { title: string; pages: number } | null = null;

    const withPages = books.filter((b) => typeof b.pages === "number") as Array<{
      title: string;
      pages: number;
    }>;

    if (withPages.length > 0) {
      const sortedByPages = [...withPages].sort((a, b) => a.pages - b.pages);
      const shortest = sortedByPages[0];
      const longest = sortedByPages[sortedByPages.length - 1];
      shortestBook = { title: shortest.title, pages: shortest.pages };
      longestBook = { title: longest.title, pages: longest.pages };
    }

    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks,
      firstBook,
      latestBook,
      averagePages,
      genres,
      longestBook,
      shortestBook,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al calcular estadísticas del autor" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const [totalAuthors, totalBooks, avgPagesAgg, genresRaw] = await Promise.all([
      prisma.author.count(),
      prisma.book.count(),
      prisma.book.aggregate({ _avg: { pages: true } }),
      prisma.book.findMany({
        where: { genre: { not: null } },
        select: { genre: true },
        distinct: ["genre"],
      }),
    ]);

    const averagePages = Math.round(avgPagesAgg._avg.pages || 0);
    const genres = genresRaw
      .map((r) => (r.genre ? r.genre.trim() : null))
      .filter((g): g is string => !!g);

    return NextResponse.json({
      totalAuthors,
      totalBooks,
      averagePages,
      genres,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 },
    );
  }
}

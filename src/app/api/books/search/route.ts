import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// GET /api/books/search?search=amor&genre=Novela&authorName=Garcia&page=1&limit=10&sortBy=publishedYear&order=desc
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const genre = searchParams.get("genre")?.trim() || "";
  const authorName = searchParams.get("authorName")?.trim() || "";
  const authorId = searchParams.get("authorId")?.trim() || "";

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10);
    const limit = Math.min(Math.max(rawLimit, 1), 50);

    const sortBy = (searchParams.get("sortBy") || "createdAt") as
      | "title"
      | "publishedYear"
      | "createdAt";
    const order = (searchParams.get("order") || "desc") as "asc" | "desc";

    const where: any = {};

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    if (genre) {
      where.genre = genre;
    }
    if (authorName) {
      where.author = { name: { contains: authorName, mode: "insensitive" } };
    }
    if (authorId) {
      where.authorId = authorId;
    }

    const skip = (page - 1) * limit;

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          author: { select: { id: true, name: true, nationality: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error en la búsqueda de libros" },
      { status: 500 },
    );
  }
}

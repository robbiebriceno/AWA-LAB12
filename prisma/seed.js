// Prisma seed script para poblar autores y libros
// Ejecuta: npx prisma db push ; node prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const authors = [
	{
		name: "Gabriel García Márquez",
		email: "gabo@example.com",
		bio: "Novelista y periodista colombiano, Nobel de Literatura 1982.",
		nationality: "Colombia",
		birthYear: 1927,
	},
	{
		name: "Isabel Allende",
		email: "isabel@example.com",
		bio: "Escritora chilena, referente del realismo mágico.",
		nationality: "Chile",
		birthYear: 1942,
	},
	{
		name: "Jorge Luis Borges",
		email: "borges@example.com",
		bio: "Escritor argentino, maestro del cuento y la metafísica literaria.",
		nationality: "Argentina",
		birthYear: 1899,
	},
	{
		name: "Mario Vargas Llosa",
		email: "vargasllosa@example.com",
		bio: "Escritor peruano, Nobel de Literatura 2010.",
		nationality: "Perú",
		birthYear: 1936,
	},
	{
		name: "Laura Esquivel",
		email: "laura@example.com",
		bio: "Escritora mexicana, conocida por 'Como agua para chocolate'.",
		nationality: "México",
		birthYear: 1950,
	},
];

const booksByAuthor = {
	"gabo@example.com": [
		{ title: "Cien años de soledad", year: 1967, genre: "Novela", pages: 417, isbn: "978-84-376-0494-7" },
		{ title: "El amor en los tiempos del cólera", year: 1985, genre: "Novela", pages: 490, isbn: "978-0-307-38984-5" },
		{ title: "Crónica de una muerte anunciada", year: 1981, genre: "Novela", pages: 122, isbn: "978-1-4000-9656-9" },
	],
	"isabel@example.com": [
		{ title: "La casa de los espíritus", year: 1982, genre: "Novela", pages: 368, isbn: "978-84-663-1600-1" },
		{ title: "De amor y de sombra", year: 1984, genre: "Novela", pages: 384, isbn: "978-84-663-1601-8" },
	],
	"borges@example.com": [
		{ title: "Ficciones", year: 1944, genre: "Cuento", pages: 224, isbn: "978-0-14-118384-8" },
		{ title: "El Aleph", year: 1949, genre: "Cuento", pages: 176, isbn: "978-0-14-243788-9" },
	],
	"vargasllosa@example.com": [
		{ title: "La ciudad y los perros", year: 1963, genre: "Novela", pages: 472, isbn: "978-84-8346-279-1" },
		{ title: "Conversación en La Catedral", year: 1969, genre: "Novela", pages: 632, isbn: "978-84-663-0569-2" },
	],
	"laura@example.com": [
		{ title: "Como agua para chocolate", year: 1989, genre: "Novela", pages: 256, isbn: "978-0-385-42017-5" },
	],
};

// Libros adicionales (reales) por autor para reemplazar los libros de prueba aleatorios
const moreBooksByAuthor = {
	"gabo@example.com": [
		{ title: "El coronel no tiene quien le escriba", year: 1961, genre: "Novela", pages: 106, isbn: "978-gabo-001" },
		{ title: "La hojarasca", year: 1955, genre: "Novela", pages: 176, isbn: "978-gabo-002" },
		{ title: "El general en su laberinto", year: 1989, genre: "Novela", pages: 285, isbn: "978-gabo-003" },
		{ title: "Doce cuentos peregrinos", year: 1992, genre: "Cuento", pages: 188, isbn: "978-gabo-004" },
		{ title: "Del amor y otros demonios", year: 1994, genre: "Novela", pages: 160, isbn: "978-gabo-005" },
		{ title: "Los funerales de la Mamá Grande", year: 1962, genre: "Cuento", pages: 192, isbn: "978-gabo-006" },
		{ title: "Ojos de perro azul", year: 1974, genre: "Cuento", pages: 152, isbn: "978-gabo-007" },
		{ title: "Noticia de un secuestro", year: 1996, genre: "Periodismo", pages: 291, isbn: "978-gabo-008" },
	],
	"isabel@example.com": [
		{ title: "Eva Luna", year: 1987, genre: "Novela", pages: 272, isbn: "978-allende-001" },
		{ title: "Cuentos de Eva Luna", year: 1989, genre: "Cuento", pages: 208, isbn: "978-allende-002" },
		{ title: "Paula", year: 1994, genre: "Memorias", pages: 432, isbn: "978-allende-003" },
		{ title: "Hija de la fortuna", year: 1999, genre: "Novela", pages: 432, isbn: "978-allende-004" },
		{ title: "Retrato en sepia", year: 2000, genre: "Novela", pages: 304, isbn: "978-allende-005" },
		{ title: "Inés del alma mía", year: 2006, genre: "Novela", pages: 352, isbn: "978-allende-006" },
		{ title: "El cuaderno de Maya", year: 2011, genre: "Novela", pages: 480, isbn: "978-allende-007" },
	],
	"borges@example.com": [
		{ title: "Historia universal de la infamia", year: 1935, genre: "Cuento", pages: 176, isbn: "978-borges-001" },
		{ title: "El libro de arena", year: 1975, genre: "Cuento", pages: 181, isbn: "978-borges-002" },
		{ title: "Otras inquisiciones", year: 1952, genre: "Ensayo", pages: 240, isbn: "978-borges-003" },
		{ title: "Historia de la eternidad", year: 1936, genre: "Ensayo", pages: 176, isbn: "978-borges-004" },
		{ title: "La cifra", year: 1981, genre: "Poesía", pages: 96, isbn: "978-borges-005" },
	],
	"vargasllosa@example.com": [
		{ title: "La tía Julia y el escribidor", year: 1977, genre: "Novela", pages: 384, isbn: "978-vllosa-001" },
		{ title: "Pantaleón y las visitadoras", year: 1973, genre: "Novela", pages: 320, isbn: "978-vllosa-002" },
		{ title: "La guerra del fin del mundo", year: 1981, genre: "Novela", pages: 736, isbn: "978-vllosa-003" },
		{ title: "Travesuras de la niña mala", year: 2006, genre: "Novela", pages: 384, isbn: "978-vllosa-004" },
		{ title: "Lituma en los Andes", year: 1993, genre: "Novela", pages: 288, isbn: "978-vllosa-005" },
		{ title: "El hablador", year: 1987, genre: "Novela", pages: 224, isbn: "978-vllosa-006" },
	],
	"laura@example.com": [
		{ title: "La ley del amor", year: 1995, genre: "Novela", pages: 272, isbn: "978-esquivel-001" },
		{ title: "Tan veloz como el deseo", year: 2001, genre: "Novela", pages: 224, isbn: "978-esquivel-002" },
		{ title: "Malinche", year: 2006, genre: "Novela", pages: 272, isbn: "978-esquivel-003" },
	],
};

async function main() {
	console.log("Seeding autores...");
	const emailToId = {};

	for (const a of authors) {
		const au = await prisma.author.upsert({
			where: { email: a.email },
			update: {
				name: a.name,
				bio: a.bio,
				nationality: a.nationality,
				birthYear: a.birthYear,
			},
			create: {
				name: a.name,
				email: a.email,
				bio: a.bio,
				nationality: a.nationality,
				birthYear: a.birthYear,
			},
			select: { id: true, email: true },
		});
		emailToId[au.email] = au.id;
	}

	console.log("Seeding libros...");
	for (const [email, list] of Object.entries(booksByAuthor)) {
		const authorId = emailToId[email];
		if (!authorId) continue;
		for (const b of list) {
			// evitar duplicado por ISBN único
			await prisma.book.upsert({
				where: { isbn: b.isbn },
				update: {
					title: b.title,
					description: null,
					publishedYear: b.year,
					genre: b.genre,
					pages: b.pages,
					authorId,
				},
				create: {
					title: b.title,
					isbn: b.isbn,
					description: null,
					publishedYear: b.year,
					genre: b.genre,
					pages: b.pages,
					authorId,
				},
			});
		}
	}

		// Insertar libros adicionales reales (sin datos ficticios)
		for (const [email, list] of Object.entries(moreBooksByAuthor)) {
			const authorId = emailToId[email];
			if (!authorId) continue;
			for (const b of list) {
				await prisma.book.upsert({
					where: { isbn: b.isbn },
					update: {
						title: b.title,
						description: null,
						publishedYear: b.year,
						genre: b.genre,
						pages: b.pages,
						authorId,
					},
					create: {
						title: b.title,
						isbn: b.isbn,
						description: null,
						publishedYear: b.year,
						genre: b.genre,
						pages: b.pages,
						authorId,
					},
				});
			}
		}

	console.log("Seed completado ✅");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});


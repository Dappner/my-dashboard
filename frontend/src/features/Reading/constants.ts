import type { Book, ReadingHistoryData, ReadingStatsData } from "./types";

export const books: Book[] = [
	{
		id: "1",
		title: "The Midnight Library",
		author: "Matt Haig",
		coverUrl:
			"https://m.media-amazon.com/images/I/81tCtHFtOgL._AC_UF1000,1000_QL80_.jpg",
		status: "Reading",
		progress: 65, // percentage
		currentPage: 208,
		totalPages: 320,
		startedAt: new Date("2025-03-25"),
		lastReadAt: new Date("2025-04-16"),
		genre: "Fiction",
		rating: 4.5,
	},
	{
		id: "2",
		title: "Atomic Habits",
		author: "James Clear",
		coverUrl:
			"https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg",

		status: "Reading",
		progress: 30,
		currentPage: 82,
		totalPages: 273,
		startedAt: new Date("2025-04-05"),
		lastReadAt: new Date("2025-04-15"),
		genre: "Self-Help",
		rating: null,
	},
	{
		id: "3",
		title: "Project Hail Mary",
		author: "Andy Weir",
		coverUrl:
			"https://m.media-amazon.com/images/I/81wOzJfwJAL._AC_UF1000,1000_QL80_.jpg",
		status: "Reading",
		progress: 12,
		currentPage: 55,
		totalPages: 476,
		startedAt: new Date("2025-04-14"),
		lastReadAt: new Date("2025-04-17"),
		genre: "Science Fiction",
		rating: null,
	},

	{
		id: "101",
		title: "The Psychology of Money",
		author: "Morgan Housel",
		coverUrl:
			"https://m.media-amazon.com/images/I/71TRB-MnFOL._AC_UF1000,1000_QL80_.jpg",
		status: "Finished",
		totalPages: 252,
		startedAt: new Date("2025-03-01"),
		finishedAt: new Date("2025-03-18"),
		genre: "Finance",
		rating: 5,
		timeToFinish: 17, // days
	},
	{
		id: "102",
		title: "Dune",
		author: "Frank Herbert",
		coverUrl:
			"https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg",

		status: "Finished",
		totalPages: 688,
		startedAt: new Date("2025-02-10"),
		finishedAt: new Date("2025-03-10"),
		genre: "Science Fiction",
		rating: 4,
		timeToFinish: 28,
	},
	{
		id: "103",
		title: "Educated",
		author: "Tara Westover",
		coverUrl:
			"https://m.media-amazon.com/images/I/71uG3SbGZ4L._AC_UF1000,1000_QL80_.jpg",
		status: "Finished",
		totalPages: 352,
		startedAt: new Date("2025-01-15"),
		finishedAt: new Date("2025-02-05"),
		genre: "Memoir",
		rating: 4.5,
		timeToFinish: 21,
	},
];

export const readingStats: ReadingStatsData = {
	booksReadThisYear: 8,
	booksReadLastYear: 12,
	pagesReadThisYear: 2456,
	averageReadingTime: 42, // minutes per day
	streak: 15, // days
	longestStreak: 23, // days
	averageBooksPerMonth: 1.8,
	favGenre: "Science Fiction",
	totalBooksOwned: 47,
	toBeReadCount: 15,
	readingGoal: 20, // books this year
	readingGoalProgress: 8, // books read so far
};

// Reading history
export const readingHistory: ReadingHistoryData[] = [
	{ month: "Jan", pagesRead: 410, booksFinished: 1 },
	{ month: "Feb", pagesRead: 650, booksFinished: 2 },
	{ month: "Mar", pagesRead: 820, booksFinished: 3 },
	{ month: "Apr", pagesRead: 576, booksFinished: 2 },
	{ month: "May", pagesRead: 0, booksFinished: 0 },
	{ month: "Jun", pagesRead: 0, booksFinished: 0 },
	{ month: "Jul", pagesRead: 0, booksFinished: 0 },
	{ month: "Aug", pagesRead: 0, booksFinished: 0 },
	{ month: "Sep", pagesRead: 0, booksFinished: 0 },
	{ month: "Oct", pagesRead: 0, booksFinished: 0 },
	{ month: "Nov", pagesRead: 0, booksFinished: 0 },
	{ month: "Dec", pagesRead: 0, booksFinished: 0 },
];

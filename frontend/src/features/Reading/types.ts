interface Book {
	id: string;
	status: "NotStarted" | "Reading" | "Finished";
	title: string;
	author: string;
	coverUrl?: string;
	totalPages: number;
	genre: string;
	progress?: number;
	currentPage?: number;
	lastReadAt?: Date;
	startedAt?: Date;
	finishedAt?: Date;
	rating?: number | null;
	timeToFinish?: number;
}

// Reading Stats
interface ReadingStatsData {
	booksReadThisYear: number;
	booksReadLastYear: number;
	pagesReadThisYear: number;
	averageReadingTime: number; // minutes per day
	streak: number; // current streak in days
	longestStreak: number; // longest streak ever in days
	averageBooksPerMonth: number;
	favGenre: string;
	totalBooksOwned: number;
	toBeReadCount: number;
	readingGoal: number; // yearly goal
	readingGoalProgress: number; // books read toward goal
}

// Reading History
interface ReadingHistoryData {
	month: string;
	pagesRead: number;
	booksFinished: number;
}

// Reading Session
interface ReadingSession {
	id: string;
	bookId: string;
	date: Date;
	duration: number; // minutes
	pagesRead: number;
	startPage: number;
	endPage: number;
	notes: string;
}

// Book Note
interface BookNote {
	id: string;
	bookId: string;
	page: number;
	content: string;
	createdAt: Date;
	updatedAt: Date;
}

export type {
	Book,
	ReadingStatsData,
	ReadingHistoryData,
	ReadingSession,
	BookNote,
};

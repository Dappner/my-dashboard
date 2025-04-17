import { BookOpen } from "lucide-react";
import type { Book } from "../types";
import { BookCard } from "./BookCard";

interface RecentlyFinishedListProps {
	books: Book[];
}

export const RecentlyFinishedList = ({ books }: RecentlyFinishedListProps) => {
	return (
		<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{books.length === 0 ? (
				<div className="text-center py-12 bg-muted/20 rounded-lg">
					<BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
					<h3 className="mt-4 text-lg font-medium">No finished books</h3>
					<p className="text-muted-foreground mt-1">
						Your completed books will appear here
					</p>
				</div>
			) : (
				books.map((book) => <BookCard key={book.id} book={book} />)
			)}
		</div>
	);
};

import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import type { Book } from "../types";
import { BookCard } from "./BookCard";

interface CurrentlyReadingListProps {
	books: Book[];
}

export const CurrentlyReadingList = ({ books }: CurrentlyReadingListProps) => {
	return (
		<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{books.length === 0 ? (
				<div className="text-center py-12 bg-muted/20 rounded-lg">
					<BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
					<h3 className="mt-4 text-lg font-medium">No books in progress</h3>
					<p className="text-muted-foreground mt-1">
						Add a book to start tracking your reading
					</p>
					<Button className="mt-4">Add a book</Button>
				</div>
			) : (
				books.map((book) => <BookCard key={book.id} book={book} />)
			)}
		</div>
	);
};

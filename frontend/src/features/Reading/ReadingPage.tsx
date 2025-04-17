import { PageContainer } from "@/components/layout/components/PageContainer";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ChevronRight, Plus } from "lucide-react";
import { CurrentlyReadingList } from "./components/CurrentlyReading";
import { ReadingGoals } from "./components/ReadingGoals";
import { ReadingHistoryChart } from "./components/ReadingHistoryChart";
import { ReadingStats } from "./components/ReadingStats";
import { ReadingStreak } from "./components/ReadingStreak";
import { RecentlyFinishedList } from "./components/RecentlyFinishedList";
import { books, readingHistory, readingStats } from "./constants";

// Static example data
// Reading stats
export default function ReadingPage() {
	const currentlyReadingBooks = books.filter(
		(book) => book.status === "Reading",
	);
	const finishedBooks = books.filter((book) => book.status === "Finished");
	return (
		<PageContainer>
			<header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h1 className="text-3xl font-bold tracking-tight">Reading Dashboard</h1>
				<div className="flex items-center gap-2">
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Add Book
					</Button>
				</div>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
				{/* Main content - 8 cols */}
				<div className="md:col-span-8 space-y-6">
					{/* Reading Stats Cards */}
					<ReadingStats stats={readingStats} />

					{/* Tabs for currently reading and finished books */}
					<Tabs defaultValue="current" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="current">Currently Reading</TabsTrigger>
							<TabsTrigger value="finished">Recently Finished</TabsTrigger>
						</TabsList>
						<TabsContent value="current" className="mt-4">
							<CurrentlyReadingList books={currentlyReadingBooks} />
						</TabsContent>
						<TabsContent value="finished" className="mt-4">
							<RecentlyFinishedList books={finishedBooks} />
						</TabsContent>
					</Tabs>

					{/* Reading History Chart */}
					<ReadingHistoryChart data={readingHistory} />
				</div>

				{/* Sidebar - 4 cols */}
				<div className="md:col-span-4 space-y-6">
					{/* Reading Goals */}
					<ReadingGoals
						currentBooks={readingStats.readingGoalProgress}
						goalBooks={readingStats.readingGoal}
					/>

					{/* Reading Streak */}
					<ReadingStreak
						currentStreak={readingStats.streak}
						longestStreak={readingStats.longestStreak}
					/>

					{/* To Be Read */}
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-lg flex items-center">
								<BookOpen className="h-5 w-5 mr-2" />
								To Be Read
							</CardTitle>
							<CardDescription>
								{readingStats.toBeReadCount} books on your list
							</CardDescription>
						</CardHeader>
						<CardFooter className="pt-2">
							<Button variant="outline" className="w-full">
								View Reading List
								<ChevronRight className="h-4 w-4 ml-2" />
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</PageContainer>
	);
}

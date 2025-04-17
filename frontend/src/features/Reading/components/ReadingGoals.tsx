import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Edit, Target } from "lucide-react";

interface ReadingGoalsProps {
	currentBooks: number;
	goalBooks: number;
}

export const ReadingGoals = ({
	currentBooks,
	goalBooks,
}: ReadingGoalsProps) => {
	// Calculate progress percentage
	const progressPercentage = Math.round((currentBooks / goalBooks) * 100);

	// Calculate books remaining
	const booksRemaining = goalBooks - currentBooks;

	// Calculate days remaining in the year
	const today = new Date();
	const endOfYear = new Date(today.getFullYear(), 11, 31); // December 31
	const daysRemaining = Math.ceil(
		(endOfYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
	);

	// Calculate books per day needed to reach goal
	const booksPerDayNeeded =
		booksRemaining > 0 ? (booksRemaining / daysRemaining).toFixed(2) : 0;

	// Determine if on track (based on day of year)
	const dayOfYear = Math.floor(
		(today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
			(1000 * 60 * 60 * 24),
	);
	const totalDaysInYear = 365 + (today.getFullYear() % 4 === 0 ? 1 : 0); // Account for leap years
	const expectedProgress = Math.round(
		(dayOfYear / totalDaysInYear) * goalBooks,
	);
	const onTrack = currentBooks >= expectedProgress;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-lg flex items-center">
					<Target className="h-5 w-5 mr-2" />
					Reading Goal
				</CardTitle>
				<CardDescription>Your annual reading challenge</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<span className="text-3xl font-bold">{currentBooks}</span>
						<span className="text-muted-foreground">of</span>
						<span className="text-3xl font-bold">{goalBooks}</span>
					</div>

					<div>
						<div className="flex justify-between text-sm mb-1">
							<span>Progress</span>
							<span>{progressPercentage}%</span>
						</div>
						<Progress value={progressPercentage} className="h-2" />
					</div>

					<div className="pt-2 space-y-1">
						{onTrack ? (
							<div className="text-sm text-green-600 font-medium">
								You're on track! Keep it up!
							</div>
						) : (
							<div className="text-sm text-amber-600 font-medium">
								You're {expectedProgress - currentBooks} books behind schedule
							</div>
						)}

						<div className="text-sm text-muted-foreground">
							<span>{booksRemaining} books remaining</span>
						</div>

						<div className="text-sm text-muted-foreground">
							<span>{daysRemaining} days left this year</span>
						</div>

						{booksRemaining > 0 && (
							<div className="text-sm text-muted-foreground">
								<span>Need to read {booksPerDayNeeded} books per day</span>
							</div>
						)}
					</div>
				</div>
			</CardContent>
			<CardFooter className="pt-0">
				<Button variant="outline" className="w-full">
					<Edit className="h-4 w-4 mr-2" />
					Update Goal
				</Button>
			</CardFooter>
		</Card>
	);
};

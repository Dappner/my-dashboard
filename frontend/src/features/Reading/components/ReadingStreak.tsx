import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Flame } from "lucide-react";

interface ReadingStreakProps {
  currentStreak: number;
  longestStreak: number;
}
function format(date: Date, formatString: string): string {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let result = formatString;

  // Replace the month token with the month name
  if (result.includes("MMM")) {
    result = result.replace("MMM", monthNames[date.getMonth()]);
  }

  // Replace the day token with the day
  if (result.includes("d")) {
    result = result.replace("d", date.getDate().toString());
  }

  return result;
}

export const ReadingStreak = ({
  currentStreak,
  longestStreak,
}: ReadingStreakProps) => {
  // Generate date for the streak's last reading date
  const today = new Date();
  const lastReadDate = new Date(today);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Flame className="h-5 w-5 mr-2 text-orange-500" />
          Reading Streak
        </CardTitle>
        <CardDescription>Track your daily reading habit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-2">
          <div className="text-5xl font-bold flex items-center">
            {currentStreak}
            <span className="text-orange-500 ml-2">
              <Flame className="h-8 w-8" />
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            days in a row
          </div>

          <div className="w-full mt-4 flex justify-between items-center text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold">{longestStreak}</div>
              <div className="text-xs text-muted-foreground">Best streak</div>
            </div>

            <div className="h-8 border-l border-muted-foreground/20" />

            <div className="text-center">
              <div className="text-lg font-semibold">
                {format(lastReadDate, "MMM d")}
              </div>
              <div className="text-xs text-muted-foreground">Last read</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full">
          <CheckCircle className="h-4 w-4 mr-2" />
          Log Today's Reading
        </Button>
      </CardFooter>
    </Card>
  );
};

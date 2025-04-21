import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { authorDetailRoute, bookDetailRoute } from "@/routes/reading-routes";
import { Link } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  Calendar,
  Clock,
  Edit,
  MessageSquare,
  PlusCircle,
  Star,
} from "lucide-react";
import { memo } from "react";
import type { Book } from "../types";

interface BookCardProps {
  book: Book;
  onUpdateProgress?: (bookId: string) => void;
  onStartReading?: (bookId: string) => void;
  onAddReview?: (bookId: string) => void;
}

export const BookCard = memo(
  ({ book, onUpdateProgress, onStartReading, onAddReview }: BookCardProps) => {
    const getCoverUrl = () =>
      book.coverUrl ||
      `https://via.placeholder.com/200x300?text=${encodeURIComponent(
        book.title,
      )}`;

    const formatDate = (date?: Date, pattern = "MMM d, yyyy") =>
      date ? format(date, pattern) : "N/A";

    const formatLastRead = (date?: Date) =>
      date ? `${formatDistanceToNow(date)} ago` : "Not read yet";

    const renderStatusBadge = () => {
      const badgeStyles = {
        Reading: "bg-blue-500 text-white border-none",
        Finished: "bg-green-500 text-white border-none",
        NotStarted: "border-gray-300 text-gray-600",
      };

      return (
        <Badge className={`absolute top-1 left-1 ${badgeStyles[book.status]}`}>
          {book.status === "Reading" && "Reading"}
          {book.status === "Finished" && "Finished"}
          {book.status === "NotStarted" && "Want to Read"}
        </Badge>
      );
    };

    const renderStatusDetails = () => {
      switch (book.status) {
        case "Reading":
          return (
            <div className="space-y-1">
              {book.progress !== undefined && (
                <div>
                  <div className="flex justify-between text-xs font-medium mb-0.5">
                    <span>{book.progress}%</span>
                  </div>
                  <Progress
                    value={book.progress}
                    className="h-1 bg-gray-200"
                    aria-label={`Reading progress: ${book.progress}%`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>
                      Page {book.currentPage || 0} of {book.totalPages}
                    </span>
                    <span>
                      {book.totalPages - (book.currentPage || 0)} pages left
                    </span>
                  </div>
                </div>
              )}
              {book.lastReadAt && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="size-3 mr-1" aria-hidden="true" />
                  <span>Last read {formatLastRead(book.lastReadAt)}</span>
                </div>
              )}
              {book.startedAt && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="size-3 mr-1" aria-hidden="true" />
                  <span>Started on {formatDate(book.startedAt)}</span>
                </div>
              )}
            </div>
          );

        case "Finished":
          return (
            <div className="space-y-1">
              <div className="flex flex-col space-y-1">
                {book.finishedAt && (
                  <div className="flex items-center text-xs text-muted-foreground ">
                    <Calendar className="size-3 mr-1" aria-hidden="true" />
                    <span>Finished {formatDate(book.finishedAt)}</span>
                  </div>
                )}
                <div className="flex items-center text-xs text-gray-500">
                  <BookOpen className="size-3 mr-1" aria-hidden="true" />
                  <span>{book.totalPages} pages</span>
                </div>
              </div>
              {book.timeToFinish && book.timeToFinish > 0 && (
                <div className="text-xs text-gray-500">
                  <span>
                    Read in {book.timeToFinish} days (
                    {Math.round(book.totalPages / book.timeToFinish)} pages/day)
                  </span>
                </div>
              )}
              {book.startedAt && book.finishedAt && (
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="size-3 mr-1" aria-hidden="true" />
                  <span>
                    {formatDate(book.startedAt, "MMM d")} -{" "}
                    {formatDate(book.finishedAt)}
                  </span>
                </div>
              )}
            </div>
          );

        case "NotStarted":
          return (
            <div className="flex items-center text-xs text-gray-500">
              <BookOpen className="size-3 mr-1" aria-hidden="true" />
              <span>{book.totalPages} pages</span>
            </div>
          );
      }
    };

    const renderActionButtons = () => {
      switch (book.status) {
        case "Reading":
          return (
            <Button
              size="sm"
              onClick={() => onUpdateProgress?.(book.id)}
              className="flex items-center text-xs py-1 px-2"
              aria-label="Update reading progress"
            >
              <Edit className="size-3 mr-1" aria-hidden="true" />
              Update Progress
            </Button>
          );

        case "Finished":
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddReview?.(book.id)}
              className="flex items-center text-xs py-1 px-2"
              aria-label={book.rating ? "Edit review" : "Add review"}
            >
              <MessageSquare className="size-3 mr-1" aria-hidden="true" />
              {book.rating ? "Edit Review" : "Add Review"}
            </Button>
          );

        case "NotStarted":
          return (
            <Button
              size="sm"
              onClick={() => onStartReading?.(book.id)}
              className="flex items-center text-xs py-1 px-2"
              aria-label="Start reading"
            >
              <PlusCircle className="size-3 mr-1" aria-hidden="true" />
              Start Reading
            </Button>
          );
      }
    };

    return (
      <Card className="overflow-hidden shadow-sm p-0 ">
        <CardContent className="p-0">
          <div className="flex flex-row">
            <div className="w-1/3 flex-shrink-0 relative">
              <img
                src={getCoverUrl()}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover aspect-7/12"
                loading="lazy"
              />
              {renderStatusBadge()}
            </div>

            <div className="w-2/3 px-2 py-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-1">
                  <div className="flex-1">
                    <Link
                      to={bookDetailRoute.to}
                      params={{ bookId: "1" }}
                      className="font-bold text-sm line-clamp-2 hover:underline"
                    >
                      {book.title}
                    </Link>
                    <Link
                      to={authorDetailRoute.to}
                      params={{ authorId: "1" }}
                      className="text-muted-foreground text-xs mt-0.5 hover:underline"
                    >
                      {book.author}
                    </Link>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {book.genre}
                    </p>
                  </div>
                  {book.rating && (
                    <div className="flex items-center">
                      <Star
                        className="size-3 fill-yellow-400 text-yellow-400"
                        aria-hidden="true"
                      />
                      <span className="ml-0.5 text-xs font-medium">
                        {book.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                {renderStatusDetails()}
              </div>

              <div className="flex justify-end items-center gap-1">
                {renderActionButtons()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);

BookCard.displayName = "BookCard";

import { PageContainer } from "@/components/layout/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authorDetailRoute, bookDetailRoute } from "@/routes/reading-routes";
import { Link, useRouter } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ChevronLeft,
  Edit,
  Heart,
  MessageSquare,
  Share2,
  Star,
  User,
} from "lucide-react";
import { useState } from "react";

// Mock data for a book detail page
const bookData = {
  id: "book-123",
  title: "The Midnight Library",
  author: "Matt Haig",
  coverUrl:
    "https://m.media-amazon.com/images/I/81tCtHFtOgL._AC_UF1000,1000_QL80_.jpg",
  description:
    "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices... Would you have done anything different, if you had the chance to undo your regrets?",
  publicationDate: new Date("2020-08-13"),
  publisher: "Canongate Books",
  isbn: "9781786892737",
  pages: 304,
  genres: ["Fiction", "Fantasy", "Science Fiction", "Contemporary"],
  rating: 4.2,
  totalRatings: 487523,
  language: "English",
  format: "Hardcover",
  readingStatus: "reading", // reading, want-to-read, finished
  progress: 65, // percentage
  currentPage: 197,
  startedAt: new Date("2025-03-25"),
  lastReadAt: new Date("2025-04-16"),
  userRating: 4,
  notes: [
    {
      id: "note-1",
      page: 42,
      content:
        '"The only way to learn is to live." - This quote really resonated with me.',
      createdAt: new Date("2025-03-28T14:22:00"),
    },
    {
      id: "note-2",
      page: 112,
      content:
        "The concept of regret is so powerfully explored here. We all wonder 'what if' but rarely consider the downsides of alternative paths.",
      createdAt: new Date("2025-04-10T20:15:00"),
    },
  ],
  readingSessions: [
    {
      id: "session-1",
      date: new Date("2025-03-25"),
      pagesRead: 28,
      startPage: 1,
      endPage: 28,
    },
    {
      id: "session-2",
      date: new Date("2025-03-26"),
      pagesRead: 18,
      startPage: 29,
      endPage: 46,
    },
    {
      id: "session-3",
      date: new Date("2025-04-02"),
      pagesRead: 42,
      startPage: 47,
      endPage: 88,
    },
    {
      id: "session-4",
      date: new Date("2025-04-10"),
      pagesRead: 55,
      startPage: 89,
      endPage: 143,
    },
    {
      id: "session-5",
      date: new Date("2025-04-16"),
      pagesRead: 54,
      startPage: 144,
      endPage: 197,
    },
  ],
  relatedBooks: [
    {
      id: "book-124",
      title: "The Invisible Life of Addie LaRue",
      author: "V.E. Schwab",
      coverUrl:
        "https://m.media-amazon.com/images/I/51FVPBXvfwL._SX327_BO1,204,203,200_.jpg",
    },
    {
      id: "book-125",
      title: "A Man Called Ove",
      author: "Fredrik Backman",
      coverUrl:
        "https://m.media-amazon.com/images/I/41acjH3LzJL._SX322_BO1,204,203,200_.jpg",
    },
    {
      id: "book-126",
      title: "The Humans",
      author: "Matt Haig",
      coverUrl:
        "https://m.media-amazon.com/images/I/81VCymmtVbL._AC_UF1000,1000_QL80_.jpg",
    },
  ],
};

export default function BookDetailPage() {
  const [favorited, setFavorited] = useState(false);
  const router = useRouter();

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" className="mb-2" asChild>
        <Link
          to="/"
          onClick={(e) => {
            e.preventDefault();
            router.history.back();
          }}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column: Book Cover, Progress and Info */}
        <div className="md:col-span-4 space-y-4">
          {/* Book Cover with Action Buttons */}
          <div className="relative">
            <img
              src={bookData.coverUrl}
              alt={`Cover of ${bookData.title}`}
              className="w-full max-h-128 rounded-md object-contain aspect-7/12"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className={`rounded-full ${favorited ? "bg-pink-100 text-pink-500" : ""}`}
                onClick={() => setFavorited(!favorited)}
              >
                <Heart
                  className={`h-5 w-5 ${favorited ? "fill-pink-500" : ""}`}
                />
              </Button>
              <Button size="icon" variant="secondary" className="rounded-full">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Reading Progress */}
          {bookData.readingStatus === "reading" && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle>Your Reading Progress</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{bookData.progress}%</span>
                  </div>
                  <Progress value={bookData.progress} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Page</p>
                    <p className="font-medium">
                      {bookData.currentPage} / {bookData.pages}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pages Left</p>
                    <p className="font-medium">
                      {bookData.pages - bookData.currentPage}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Update Progress
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Book Information */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Book Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="flex flex-wrap gap-1 mb-3">
                {bookData.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Format</dt>
                <dd>{bookData.format}</dd>
                <dt className="text-muted-foreground">Published</dt>
                <dd>{format(bookData.publicationDate, "MMM d, yyyy")}</dd>
                <dt className="text-muted-foreground">Publisher</dt>
                <dd>{bookData.publisher}</dd>
                <dt className="text-muted-foreground">Pages</dt>
                <dd>{bookData.pages}</dd>
                <dt className="text-muted-foreground">ISBN</dt>
                <dd className="break-all">{bookData.isbn}</dd>
              </dl>
            </CardContent>
          </Card>
        </div>
        {/* Right Column: Main Content */}
        <div className="md:col-span-8 space-y-4">
          {/* Book Title, Author, Rating */}
          <div>
            <h1 className="text-3xl font-bold mb-1">{bookData.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                to={authorDetailRoute.to}
                params={{ authorId: bookData.author }}
                className="text-lg text-muted-foreground hover:underline flex items-center"
              >
                <User className="h-4 w-4 mr-1" />
                {bookData.author}
              </Link>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{bookData.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({bookData.totalRatings.toLocaleString()} ratings)
                </span>
              </div>
            </div>
          </div>

          {/* Description - Compact */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">About this Book</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <p className="text-sm text-muted-foreground">
                {bookData.description}
              </p>
            </CardContent>
          </Card>

          {/* Tabs: Notes, Sessions */}
          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid grid-cols-2 mb-3">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="sessions">Reading Log</TabsTrigger>
            </TabsList>

            {/* Notes Tab */}
            <TabsContent value="notes" className="relative">
              <div className="absolute right-0 -top-12 flex flex-row justify-end">
                <Button size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </div>
              <div>
                {bookData.notes.length === 0 ? (
                  <div className="text-center py-6">
                    <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/30" />
                    <h3 className="mt-3 font-medium text-sm">No notes yet</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add your first note to remember your thoughts
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookData.notes.map((note) => (
                      <div key={note.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="outline">Page {note.page}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(note.createdAt, "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="relative">
              <div className="absolute right-0 -top-12 flex flex-row justify-end">
                <Button size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Log Reading
                </Button>
              </div>
              <div>
                {bookData.readingSessions.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="h-10 w-10 mx-auto text-muted-foreground/30" />
                    <h3 className="mt-3 font-medium text-sm">
                      No reading sessions
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Log your reading progress to track your journey
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookData.readingSessions.map((session) => (
                      <div key={session.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">
                            {format(session.date, "EEEE, MMMM d")}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            Pages {session.startPage} - {session.endPage}
                          </span>
                          <span>{session.pagesRead} pages</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <h3 className="font-medium mb-3">Similar Books</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {bookData.relatedBooks.map((book) => (
                <Link
                  key={book.id}
                  to={bookDetailRoute.to}
                  params={{ bookId: book.id }}
                  className="block"
                >
                  <Card className="h-48 overflow-hidden hover:ring-1 hover:ring-primary/20 transition-all">
                    <div className="aspect-[2/3] relative">
                      <img
                        src={book.coverUrl}
                        alt={`Cover of ${book.title}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-2 text-center">
                      <p className="font-medium text-xs truncate">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {book.author}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

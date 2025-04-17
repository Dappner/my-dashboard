import { PageContainer } from "@/components/layout/components/PageContainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
	Award,
	BookOpen,
	Calendar,
	ChevronLeft,
	GlobeIcon,
	Heart,
	HistoryIcon,
	Library,
	LineChart,
	Share2,
	Star,
} from "lucide-react";
import { useState } from "react";

// Mock data for an author
const authorData = {
	id: "author-101",
	name: "Matt Haig",
	imageUrl:
		"https://matthaig.com/wp-content/uploads/2022/01/AW_MATT_2019_HIGH_RES_11-e1643375734168.jpg",
	bio: "Matt Haig is a British author for children and adults. His memoir, Reasons to Stay Alive, was a number one bestseller, staying in the British top ten for 46 weeks. His children's book, A Boy Called Christmas, was a runaway hit and is translated in over 40 languages. It is being made into a film starring Maggie Smith, Sally Hawkins and Jim Broadbent. His novels for adults include the award-winning How To Stop Time, The Midnight Library, and The Humans.",
	birthDate: new Date("1975-07-03"),
	nationality: "British",
	website: "https://matthaig.com",
	twitter: "@matthaig1",
	genres: ["Fiction", "Fantasy", "Science Fiction", "Self-help", "Non-fiction"],
	awards: [
		{
			name: "Smarties Book Prize",
			year: 2007,
			work: "Shadow Forest",
		},
		{
			name: "Blue Peter Book Award",
			year: 2016,
			work: "A Boy Called Christmas",
		},
	],
	statistics: {
		booksPublished: 17,
		booksRead: 5,
		averageRating: 4.3,
		totalReviews: 1200000,
		bestSellingBook: "The Midnight Library",
		mostRecentBook: "The Comfort Book",
	},
	books: [
		{
			id: "book-123",
			title: "The Midnight Library",
			coverUrl:
				"https://m.media-amazon.com/images/I/81tCtHFtOgL._AC_UF1000,1000_QL80_.jpg",
			publicationDate: new Date("2020-08-13"),
			rating: 4.2,
			isRead: true,
			readStatus: "reading",
			description:
				"Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
		},
		{
			id: "book-126",
			title: "The Humans",
			coverUrl:
				"https://m.media-amazon.com/images/I/81VCymmtVbL._AC_UF1000,1000_QL80_.jpg",
			publicationDate: new Date("2014-05-29"),
			rating: 4.0,
			isRead: true,
			readStatus: "finished",
			description:
				"Body-snatching has never been so heartwarming. When an extraterrestrial visitor arrives on Earth, his first impressions of the human species are less than positive.",
		},
		{
			id: "book-127",
			title: "Reasons to Stay Alive",
			coverUrl:
				"https://m.media-amazon.com/images/I/71fWCZS5OxL._AC_UF1000,1000_QL80_.jpg",
			publicationDate: new Date("2016-02-23"),
			rating: 4.3,
			isRead: true,
			readStatus: "finished",
			description:
				"Like nearly one in five people, Matt Haig suffers from depression. Reasons to Stay Alive is his inspiring account of how, minute by minute and day by day, he overcame the disease with the help of reading, writing, and the love of his parents and his girlfriend.",
		},
		{
			id: "book-128",
			title: "How to Stop Time",
			coverUrl:
				"https://m.media-amazon.com/images/I/71LJ+kTuqAL._AC_UF1000,1000_QL80_.jpg",
			publicationDate: new Date("2018-02-06"),
			rating: 3.9,
			isRead: true,
			readStatus: "finished",
			description:
				"Tom Hazard has a dangerous secret. He may look like an ordinary 41-year-old, but owing to a rare condition, he's been alive for centuries.",
		},
		{
			id: "book-129",
			title: "The Comfort Book",
			coverUrl:
				"https://m.media-amazon.com/images/I/71hzM1+4SYL._AC_UF1000,1000_QL80_.jpg",
			publicationDate: new Date("2021-07-06"),
			rating: 4.1,
			isRead: false,
			readStatus: "want-to-read",
			description:
				"A collection of consolations learned in hard times and suggestions for making the bad days better.",
		},
		{
			id: "book-130",
			title: "Notes on a Nervous Planet",
			coverUrl:
				"https://m.media-amazon.com/images/I/713zOgc4mxL._AC_UF1000,1000_QL80_.jpg",
			publicationDate: new Date("2019-01-29"),
			rating: 4.0,
			isRead: false,
			readStatus: "want-to-read",
			description:
				"The world is messing with our minds. What if there was something we could do about it? Looking at sleep, news, social media, addiction, work and play, Matt Haig invites us to feel calmer, happier and to question the habits of the digital age.",
		},
	],
	similarAuthors: [
		{
			id: "author-102",
			name: "Fredrik Backman",
			imageUrl: "https://images.gr-assets.com/authors/1479499717p8/6485178.jpg",
		},
		{
			id: "author-103",
			name: "Kazuo Ishiguro",
			imageUrl: "https://images.gr-assets.com/authors/1422411945p8/4280.jpg",
		},
		{
			id: "author-104",
			name: "David Nicholls",
			imageUrl: "https://images.gr-assets.com/authors/1271862289p8/13538.jpg",
		},
	],
	timeline: [
		{
			year: 1975,
			event: "Born in Sheffield, England",
		},
		{
			year: 1999,
			event:
				"Graduated from the University of Hull with a degree in English and History",
		},
		{
			year: 2004,
			event: "Published first novel 'The Last Family in England'",
		},
		{
			year: 2015,
			event: "Published memoir 'Reasons to Stay Alive'",
		},
		{
			year: 2020,
			event: "Published 'The Midnight Library'",
		},
	],
};

export default function AuthorDetailPage() {
	const [following, setFollowing] = useState(false);

	// Calculate age
	const calculateAge = (birthDate: Date) => {
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	};

	// Filter books by status
	const readBooks = authorData.books.filter((book) => book.isRead);
	const toReadBooks = authorData.books.filter((book) => !book.isRead);

	// Sort books by publication date (descending)
	const sortedBooks = [...authorData.books].sort(
		(a, b) => b.publicationDate.getTime() - a.publicationDate.getTime(),
	);

	return (
		<PageContainer>
			<Button variant="ghost" size="sm" className="mb-6" asChild>
				<span>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Back to Authors
				</span>
			</Button>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Author Info Section - Left Column */}
				<div className="lg:col-span-4 space-y-6">
					{/* Author Profile Card */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-col items-center text-center">
								<Avatar className="h-32 w-32">
									<AvatarImage
										src={authorData.imageUrl}
										alt={authorData.name}
									/>
									<AvatarFallback>
										{authorData.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>

								<h1 className="text-2xl font-bold mt-4">{authorData.name}</h1>

								<div className="flex flex-wrap gap-2 justify-center mt-2">
									{authorData.genres.slice(0, 3).map((genre) => (
										<Badge key={genre} variant="secondary">
											{genre}
										</Badge>
									))}
								</div>

								<div className="flex gap-2 mt-4">
									<Button
										variant={following ? "default" : "outline"}
										onClick={() => setFollowing(!following)}
									>
										{following ? "Following" : "Follow Author"}
									</Button>
									<Button variant="outline" size="icon">
										<Share2 className="h-4 w-4" />
									</Button>
								</div>

								<div className="grid grid-cols-3 gap-4 w-full mt-6 text-center">
									<div>
										<div className="text-2xl font-bold">
											{authorData.statistics.booksPublished}
										</div>
										<div className="text-xs text-muted-foreground">Books</div>
									</div>
									<div>
										<div className="text-2xl font-bold flex items-center justify-center">
											{authorData.statistics.averageRating}
											<Star className="h-4 w-4 text-yellow-500 fill-yellow-500 ml-1" />
										</div>
										<div className="text-xs text-muted-foreground">
											Avg Rating
										</div>
									</div>
									<div>
										<div className="text-2xl font-bold">
											{authorData.statistics.booksRead}
										</div>
										<div className="text-xs text-muted-foreground">
											You've Read
										</div>
									</div>
								</div>

								<div className="mt-6 space-y-4 w-full text-left">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Nationality</span>
										<span>{authorData.nationality}</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Born</span>
										<span>
											{format(authorData.birthDate, "MMMM d, yyyy")} (
											{calculateAge(authorData.birthDate)} years)
										</span>
									</div>
									{authorData.website && (
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">Website</span>
											<a
												href={authorData.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary hover:underline flex items-center"
											>
												<GlobeIcon className="h-3 w-3 mr-1" />
												Visit Website
											</a>
										</div>
									)}
									{authorData.twitter && (
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">Twitter</span>
											<span>{authorData.twitter}</span>
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Awards */}
					{authorData.awards.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center">
									<Award className="h-5 w-5 mr-2" />
									Awards
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{authorData.awards.map((award) => (
										<div key={award.name} className="flex justify-between">
											<div>
												<div className="font-medium">{award.name}</div>
												<div className="text-sm text-muted-foreground">
													for {award.work}
												</div>
											</div>
											<Badge variant="outline">{award.year}</Badge>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Similar Authors */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Similar Authors</CardTitle>
							<CardDescription>You might also like</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{authorData.similarAuthors.map((author) => (
									<div key={author.id} className="flex items-center gap-3">
										<Avatar className="h-10 w-10">
											<AvatarImage src={author.imageUrl} alt={author.name} />
											<AvatarFallback>
												{author.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div>
											<span className="font-medium hover:underline">
												{author.name}
											</span>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content - Right Column */}
				<div className="lg:col-span-8 space-y-6">
					{/* Author Bio */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">About {authorData.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="leading-relaxed">{authorData.bio}</p>
						</CardContent>
					</Card>

					{/* Author Timeline */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center">
								<HistoryIcon className="h-5 w-5 mr-2" />
								Timeline
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ol className="relative border-l border-muted-foreground/20">
								{authorData.timeline.map((event, index) => (
									<li key={event.event} className="mb-6 ml-6">
										<span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-background bg-primary text-primary-foreground">
											{index + 1}
										</span>
										<h3 className="flex items-center text-lg font-semibold">
											{event.event}
										</h3>
										<time className="block mb-2 text-sm font-normal leading-none text-muted-foreground">
											{event.year}
										</time>
									</li>
								))}
							</ol>
						</CardContent>
					</Card>

					{/* Books Tabs */}
					<Tabs defaultValue="published" className="w-full">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="published">All Books</TabsTrigger>
							<TabsTrigger value="read">Books You've Read</TabsTrigger>
							<TabsTrigger value="toread">Want to Read</TabsTrigger>
						</TabsList>

						{/* All Books Tab */}
						<TabsContent value="published" className="mt-4">
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-lg flex items-center">
										<Library className="h-5 w-5 mr-2" />
										Published Books
									</CardTitle>
									<CardDescription>
										{authorData.statistics.booksPublished} books published
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-6 sm:grid-cols-2">
										{sortedBooks.map((book) => (
											<div key={book.id} className="flex gap-4">
												<img
													src={book.coverUrl}
													alt={`Cover of ${book.title}`}
													className="w-20 h-28 object-cover rounded-sm shadow-md"
												/>
												<div className="flex flex-col justify-between">
													<div>
														<h3 className="font-medium">{book.title}</h3>
														<div className="flex items-center text-sm text-muted-foreground">
															<Calendar className="h-3 w-3 mr-1" />
															{format(book.publicationDate, "yyyy")}
														</div>
														<div className="flex items-center mt-1">
															<Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
															<span className="text-xs ml-1">
																{book.rating}
															</span>
														</div>
													</div>
													{book.isRead ? (
														<Badge
															variant="secondary"
															className="w-fit text-xs"
														>
															{book.readStatus === "reading"
																? "Currently Reading"
																: "Read"}
														</Badge>
													) : (
														<Button
															size="sm"
															variant="outline"
															className="text-xs h-7 mt-2 w-fit"
														>
															Want to Read
														</Button>
													)}
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Books You've Read Tab */}
						<TabsContent value="read" className="mt-4">
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-lg flex items-center">
										<BookOpen className="h-5 w-5 mr-2" />
										Books You've Read
									</CardTitle>
									<CardDescription>
										You've read {readBooks.length} books by this author
									</CardDescription>
								</CardHeader>
								<CardContent>
									{readBooks.length === 0 ? (
										<div className="text-center py-8">
											<BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
											<h3 className="mt-4 text-lg font-medium">
												No books read yet
											</h3>
											<p className="text-muted-foreground">
												Add a book to your reading list
											</p>
										</div>
									) : (
										<div className="grid gap-6 sm:grid-cols-2">
											{readBooks.map((book) => (
												<div key={book.id} className="flex gap-4">
													<img
														src={book.coverUrl}
														alt={`Cover of ${book.title}`}
														className="w-20 h-28 object-cover rounded-sm shadow-md"
													/>
													<div>
														<h3 className="font-medium">{book.title}</h3>
														<div className="flex items-center text-sm text-muted-foreground">
															<Calendar className="h-3 w-3 mr-1" />
															{format(book.publicationDate, "yyyy")}
														</div>
														<div className="flex items-center mt-1">
															<Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
															<span className="text-xs ml-1">
																{book.rating}
															</span>
														</div>
														<Badge
															variant="secondary"
															className="mt-2 w-fit text-xs"
														>
															{book.readStatus === "reading"
																? "Currently Reading"
																: "Read"}
														</Badge>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						{/* Want to Read Tab */}
						<TabsContent value="toread" className="mt-4">
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-lg flex items-center">
										<LineChart className="h-5 w-5 mr-2" />
										Want to Read
									</CardTitle>
									<CardDescription>
										{toReadBooks.length} books on your to-read list
									</CardDescription>
								</CardHeader>
								<CardContent>
									{toReadBooks.length === 0 ? (
										<div className="text-center py-8">
											<BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
											<h3 className="mt-4 text-lg font-medium">
												Nothing on your list yet
											</h3>
											<p className="text-muted-foreground">
												Add books to your want-to-read list
											</p>
										</div>
									) : (
										<div className="grid gap-6 sm:grid-cols-2">
											{toReadBooks.map((book) => (
												<div key={book.id} className="flex gap-4">
													<img
														src={book.coverUrl}
														alt={`Cover of ${book.title}`}
														className="w-20 h-28 object-cover rounded-sm shadow-md"
													/>
													<div className="flex flex-col justify-between">
														<div>
															<h3 className="font-medium">{book.title}</h3>
															<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
																{book.description}
															</p>
														</div>
														<div className="flex gap-2 mt-2">
															<Button
																size="sm"
																variant="default"
																className="h-7 text-xs w-fit"
															>
																Start Reading
															</Button>
															<Button
																size="sm"
																variant="ghost"
																className="h-7 text-xs p-0"
															>
																<Heart className="h-3 w-3" />
															</Button>
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</PageContainer>
	);
}

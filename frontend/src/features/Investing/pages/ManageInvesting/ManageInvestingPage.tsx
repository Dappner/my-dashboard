import { PageContainer } from "@/components/layout/components/PageContainer";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTickerSheet } from "@/contexts/SheetContext";
import { useTicker } from "@/features/Investing/hooks/useTickers";
import useUser from "@/hooks/useUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { TickerSelect } from "../../forms/FormControls";
import TickerTable from "./components/TickerTable";

const trackingFormSchema = z.object({
	ticker_id: z.string().min(1, "Please select a ticker"),
});

type TrackingFormValues = z.infer<typeof trackingFormSchema>;

export default function ManageInvestingPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const { tickers, isLoading } = useTicker({});

	const { openAddTicker } = useTickerSheet();

	const { user, updateUser } = useUser();

	const form = useForm<TrackingFormValues>({
		resolver: zodResolver(trackingFormSchema),
		defaultValues: {
			ticker_id: user?.tracking_ticker_id || "",
		},
	});

	const onTrackingSubmit = async (data: TrackingFormValues) => {
		try {
			updateUser({
				id: user?.id,
				tracking_ticker_id: data.ticker_id,
			});
			toast.success("Tracking ticker updated successfully");
		} catch (error) {
			toast.error("Failed to update tracking ticker");
			console.error("Error updating tracking ticker:", error);
		}
	};
	// Filter tickers based on search query
	const filteredTickers = tickers?.filter(
		(ticker) =>
			ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
			ticker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			ticker.exchange?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			ticker.sector?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<PageContainer className="space-y-6">
			<Tabs defaultValue="tickers">
				<TabsList>
					<TabsTrigger value="tickers" className="cursor-pointer">
						Tickers
					</TabsTrigger>
					<TabsTrigger value="tracking" className="cursor-pointer">
						Tracking
					</TabsTrigger>
				</TabsList>
				<TabsContent value="tickers">
					<div className="flex items-center justify-between">
						<div className="pb-4">
							<CardTitle className="text-2xl">
								Manage Investment Tickers
							</CardTitle>
							<CardDescription>
								Add, edit, and remove tickers that you want to track for
								investment purposes.
							</CardDescription>
						</div>
						<Button onClick={openAddTicker}>
							<PlusCircle className="mr-2 h-4 w-4" />
							Add Ticker
						</Button>
					</div>
					<div className="mb-6">
						<Input
							placeholder="Search tickers by symbol, name, exchange or sector..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="max-w-md"
						/>
					</div>

					{isLoading ? (
						<div className="flex justify-center items-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : filteredTickers && filteredTickers.length > 0 ? (
						<div className="rounded-md border">
							<TickerTable filteredTickers={filteredTickers} />
						</div>
					) : (
						<div className="py-8 text-center">
							<p className="text-muted-foreground">
								{searchQuery
									? "No tickers matching your search"
									: "No tickers added yet"}
							</p>
							{!searchQuery && (
								<Button
									variant="outline"
									className="mt-4"
									onClick={openAddTicker}
								>
									<PlusCircle className="mr-2 h-4 w-4" />
									Add your first ticker
								</Button>
							)}
						</div>
					)}
				</TabsContent>
				<TabsContent value="tracking">
					<div className="space-y-4 max-w-md">
						<div>
							<CardTitle className="text-xl">
								Configure Tracking Ticker
							</CardTitle>
							<CardDescription>
								Select a ticker to use as your primary tracking index
							</CardDescription>
						</div>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onTrackingSubmit)}
								className="space-y-4"
							>
								<FormField
									control={form.control}
									name="ticker_id"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<TickerSelect
													field={field}
													isLoading={isLoading}
													tickers={tickers}
													onValueChange={(value) => {
														field.onChange(value);
														void form.handleSubmit(onTrackingSubmit)();
													}}
												/>{" "}
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit" disabled={form.formState.isSubmitting}>
									{form.formState.isSubmitting ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : null}
									Save Changes
								</Button>
							</form>
						</Form>
					</div>
				</TabsContent>
			</Tabs>
		</PageContainer>
	);
}

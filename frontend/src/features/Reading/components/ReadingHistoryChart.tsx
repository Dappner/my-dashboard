import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart as RechartsLineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { ReadingHistoryData } from "../types";

interface ReadingHistoryChartProps {
	data: ReadingHistoryData[];
}

export const ReadingHistoryChart = ({ data }: ReadingHistoryChartProps) => {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg flex items-center">
							<LineChart className="h-5 w-5 mr-2" />
							Reading History
						</CardTitle>
						<CardDescription>Your reading activity over time</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="pages">
					<TabsList className="mb-4">
						<TabsTrigger value="pages">Pages Read</TabsTrigger>
						<TabsTrigger value="books">Books Finished</TabsTrigger>
					</TabsList>

					<TabsContent value="pages">
						<div className="h-72">
							<ResponsiveContainer width="100%" height="100%">
								<RechartsLineChart
									data={data}
									margin={{
										top: 5,
										right: 30,
										left: 20,
										bottom: 5,
									}}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="month" />
									<YAxis />
									<Tooltip
										formatter={(value) => [`${value} pages`, "Pages Read"]}
									/>
									<Line
										type="monotone"
										dataKey="pagesRead"
										stroke="#8884d8"
										activeDot={{ r: 8 }}
										name="Pages Read"
									/>
								</RechartsLineChart>
							</ResponsiveContainer>
						</div>
					</TabsContent>

					<TabsContent value="books">
						<div className="h-72">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={data}
									margin={{
										top: 5,
										right: 30,
										left: 20,
										bottom: 5,
									}}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="month" />
									<YAxis allowDecimals={false} />
									<Tooltip
										formatter={(value) => [`${value} books`, "Books Finished"]}
									/>
									<Bar
										dataKey="booksFinished"
										fill="#8884d8"
										name="Books Finished"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
};

import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	type TooltipProps,
	XAxis,
	YAxis,
} from "recharts";

interface TimeTrackingChartProps {
	selectedDate: Date;
}

export const TimeTrackingChart: React.FC<TimeTrackingChartProps> = ({
	selectedDate,
}) => {
	// Generate mock data for the selected month
	const generateMockTimeData = () => {
		const daysInMonth = eachDayOfInterval({
			start: startOfMonth(selectedDate),
			end: endOfMonth(selectedDate),
		});

		return daysInMonth.map((day) => {
			// Generate more realistic time tracking data
			// Weekends have less coding time than weekdays
			const isWeekend = [0, 6].includes(day.getDay());
			const maxHours = isWeekend ? 3 : 8;

			// Projects distribution
			const totalHours = (Math.random() * maxHours).toFixed(1);
			const projectA = Math.random() * Number.parseFloat(totalHours) * 0.6;
			const projectB =
				Math.random() * (Number.parseFloat(totalHours) - projectA) * 0.7;
			const projectC = Number.parseFloat(totalHours) - projectA - projectB;

			return {
				date: format(day, "MMM dd"),
				fullDate: format(day, "EEEE, MMMM d, yyyy"),
				total: Number.parseFloat(totalHours),
				"Project A": Number.parseFloat(projectA.toFixed(1)),
				"Project B": Number.parseFloat(projectB.toFixed(1)),
				"Project C": Number.parseFloat(projectC.toFixed(1)),
				day: format(day, "d"),
			};
		});
	};
	const data = generateMockTimeData();

	const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
		if (active && payload && payload.length) {
			const dayData = payload[0].payload;
			return (
				<div className="bg-background border rounded-md p-3 shadow-md">
					<p className="font-medium text-sm">{dayData.fullDate}</p>
					<p className="text-sm mt-1">
						Total: <span className="font-medium">{dayData.total} hours</span>
					</p>
					<div className="mt-2 space-y-1">
						{payload.map((entry) => (
							<div key={entry.id} className="flex items-center text-xs">
								<div
									className="w-3 h-3 rounded-full mr-2"
									style={{ backgroundColor: entry.color }}
								/>
								<span>
									{entry.name}: {entry.value} hours
								</span>
							</div>
						))}
					</div>
				</div>
			);
		}
		return null;
	};
	return (
		<div className="w-full h-[300px]">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={data}
					margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
					barSize={20}
					barGap={0}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="date"
						scale="band"
						tick={{ fontSize: 12 }}
						tickFormatter={(value, index) => (index % 3 === 0 ? value : "")}
					/>
					<YAxis
						label={{
							value: "Hours",
							angle: -90,
							position: "insideLeft",
							style: { textAnchor: "middle" },
						}}
						tick={{ fontSize: 12 }}
					/>
					<Tooltip content={<CustomTooltip />} />
					<Legend />
					<Bar dataKey="project1" stackId="a" fill="#3b82f6" name="Project 1" />
					<Bar dataKey="project2" stackId="a" fill="#22c55e" name="Project 2" />
					<Bar dataKey="project3" stackId="a" fill="#a855f7" name="Project 3" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

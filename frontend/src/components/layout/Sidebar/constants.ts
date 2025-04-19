import {
	BookOpen,
	ChartNoAxesCombined,
	CreditCard,
	ListChecks,
} from "lucide-react";
import type { NavBarSection } from "./types";

export const navBarSections: NavBarSection[] = [
	{
		title: "Investing",
		url: "/investing",
		rootName: "Overview",
		icon: ChartNoAxesCombined,
		actions: null,
		items: [
			{
				title: "Holdings",
				url: "/investing/holdings",
			},
			{
				title: "Transactions",
				url: "/investing/transactions",
			},
			{
				title: "Research",
				url: "/investing/research",
			},
			{
				title: "Forex",
				url: "/investing/forex",
			},
			{
				title: "Manage",
				url: "/investing/manage",
			},
		],
	},
	{
		title: "Spending",
		url: "/spending",
		rootName: "Overview",
		icon: CreditCard,
		items: [
			{
				title: "Receipts",
				url: "/spending/receipts",
			},
			{
				title: "Categories",
				url: "/spending/categories",
			},
		],
	},
	{
		title: "Habits",
		url: "/habits",
		icon: ListChecks,
		rootName: "Overview",
		items: [
			{
				title: "Chess",
				url: "/habits/chess",
			},
			{
				title: "Github",
				url: "/habits/github",
			},
			{
				title: "Time Tracking",
				url: "/habits/time",
			},
		],
	},
	{
		title: "Reading",
		url: "/reading",
		icon: BookOpen,
		rootName: "Overview",
	},
];

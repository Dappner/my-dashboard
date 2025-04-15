import SpendingPage from "@/features/Spending/SpendingPage";
import ReceiptDetailPage from "@/features/Spending/pages/ReceiptDetailsPage/ReceiptDetailPage";
import ReceiptsPage from "@/features/Spending/pages/ReceiptsPage";
import { SpendingCategoriesPage } from "@/features/Spending/pages/SpendingCategoriesPage/SpendingCategoriesPage";
import SpendingCategoryDetailPage from "@/features/Spending/pages/SpendingCategoryDetailPage";
import type { AppRouteObject } from "@/types";
import { Outlet } from "react-router-dom";

export const spendingRoutes: AppRouteObject[] = [
	{
		path: "spending",
		element: <Outlet />,
		handle: {
			title: "Spending Overview",
			crumb: () => "Spending",
		},
		children: [
			{
				index: true,
				element: <SpendingPage />,
				handle: {
					title: "Spending Dashboard",
				},
			},
			{
				path: ":month",
				element: <SpendingPage />,
				handle: {
					title: "Spending Dashboard",
				},
			},
			{
				path: "receipts",
				handle: { title: "Receipts", crumb: () => "Receipts" },
				children: [
					{
						index: true,
						element: <ReceiptsPage />,
						handle: { title: "Receipts" },
					},
					{
						path: ":receiptId",
						element: <ReceiptDetailPage />,
						handle: {
							title: "Receipt Detail",
							crumb: () => "Receipt",
						},
					},
				],
			},
			{
				path: "categories",
				handle: { title: "Categories", crumb: () => "Categories" },
				children: [
					{
						index: true,
						element: <SpendingCategoriesPage />,
						handle: { title: "Categories" },
					},
					{
						path: ":month",
						element: <SpendingCategoriesPage />,
						handle: { title: "Categories" },
					},
					{
						path: ":categoryId",
						element: <SpendingCategoryDetailPage />,
						handle: {
							title: "Category Details",
							crumb: () => "Category",
						},
					},
					{
						path: ":categoryId/:month",
						element: <SpendingCategoryDetailPage />,
						handle: {
							title: "Category Details",
							crumb: () => "Category",
						},
					},
				],
			},
		],
	},
];

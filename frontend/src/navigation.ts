/**
 * Navigation helper that provides structured access to application routes
 */
export const AppRoutes = {
	home: () => "/",
	login: () => "/login",

	investing: {
		dashboard: () => "/investing",
		manage: () => "/investing/manage",
		holdings: () => "/investing/holdings",
		transactions: () => "/investing/transactions",
		research: () => "/investing/research",
		industry: (slug: string) => `/investing/industry/${slug}`,
		sector: (slug: string) => `/investing/sector/${slug}`,
		ticker: (exchange: string, symbol: string) =>
			`/investing/ticker/${exchange}/${symbol}`,
		alerts: () => "/investing/alerts",
	},

	spending: {
		dashboard: () => "/spending",
		receipts: {
			list: () => "/spending/receipts",
			detail: (id: string) => `/spending/receipts/${id}`,
		},
	},

	settings: () => "/settings",
};

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { SheetProvider } from "./contexts/SheetContext";
import { UserProvider } from "./contexts/UserContext";
import { router } from "./routes";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			refetchOnWindowFocus: false,
		},
	},
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<SheetProvider>
					<UserProvider>
						<TooltipProvider>
							<RouterProvider router={router} />
						</TooltipProvider>
					</UserProvider>
				</SheetProvider>
			</AuthProvider>
			{/* <ReactQueryDevtools initialIsOpen={false} /> */}
		</QueryClientProvider>
	);
}
export default App;

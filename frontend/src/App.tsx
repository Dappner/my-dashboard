import { RouterProvider } from "@tanstack/react-router";
import { TooltipProvider } from "./components/ui/tooltip";
import { SheetProvider } from "./contexts/SheetContext";
import { router } from "./routes";
import { UserProvider } from "./contexts/UserContext";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	return (
		<SheetProvider>
			<UserProvider>
				<TooltipProvider>
					<RouterProvider router={router} />
				</TooltipProvider>
			</UserProvider>
		</SheetProvider>
	);
}
export default App;

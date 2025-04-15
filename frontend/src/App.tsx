import { RouterProvider } from "@tanstack/react-router";
import { SheetProvider } from "./contexts/SheetContext";
import { router } from "./routes";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	return (
		<SheetProvider>
			<RouterProvider router={router} />
		</SheetProvider>
	);
}
export default App;

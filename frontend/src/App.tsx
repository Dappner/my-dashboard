import { RouterProvider } from "@tanstack/react-router";
import { SheetProvider } from "./contexts/SheetContext";
import { router } from "./routes";
import { TooltipProvider } from "./components/ui/tooltip";

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <SheetProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </SheetProvider>
  );
}
export default App;

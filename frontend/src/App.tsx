import Layout from "@/components/layout/Layout";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { SheetProvider } from "./contexts/SheetContext";
import { loginRoute, routeConfig } from "./routes";

const router = createBrowserRouter([
	{
		element: <Layout />,
		children: routeConfig,
	},
	{
		path: loginRoute.path,
		element: loginRoute.element,
	},
	// { path: "*", element: <NotFoundPage /> } // 404 Route
]);

function App() {
	return (
		<div>
			<SheetProvider>
				<RouterProvider router={router} />
			</SheetProvider>
		</div>
	);
}
export default App;

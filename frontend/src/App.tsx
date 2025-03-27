import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "@/components/layout/Layout";
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
      <RouterProvider router={router} />
    </div>
  );
}
export default App;

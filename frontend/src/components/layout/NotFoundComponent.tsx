import { Link } from "@tanstack/react-router";
import { PageContainer } from "./components/PageContainer";

export default function NotFoundComponent() {
	return (
		<PageContainer>
			<p>Page not found</p>
			<Link to="/home">Return to Home</Link>
		</PageContainer>
	);
}

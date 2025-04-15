import { Button } from "@/components/ui/button";
import { router } from "@/routes";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navBarSections } from "../Sidebar/constants";
import { MobileOverlay } from "./MobileOverlay";
import { NavUser } from "./nav-user";

export function MobileHeader() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const location = useLocation();

	// Determine current section based on URL path
	const currentPath = location.pathname;
	const currentSection = navBarSections.find((section) =>
		currentPath.startsWith(section.url),
	);

	// Get current section name for display
	const sectionTitle = currentSection?.title || "Home";

	// Get section-specific navigation items
	const sectionNavItems = currentSection?.items || [];

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
	const closeMenu = () => setIsMenuOpen(false);
	// biome-ignore lint/correctness/useExhaustiveDependencies: I thjink that's right
	useEffect(() => {
		// This function will run on any navigation event
		const unsubscribe = router.history.subscribe(() => {
			if (isMenuOpen) {
				setIsMenuOpen(false);
			}
		});

		// Clean up subscription when component unmounts
		return () => {
			unsubscribe();
		};
	}, [router.history, isMenuOpen]);
	return (
		<>
			<header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
				<div className="flex items-center gap-2">
					{sectionNavItems.length > 0 && (
						<Button variant="ghost" size="icon" onClick={toggleMenu}>
							<Menu className="h-5 w-5" />
						</Button>
					)}
					<h1 className="text-lg font-semibold">{sectionTitle}</h1>
				</div>

				<div className="flex items-center">
					<NavUser />
				</div>
			</header>

			{/* Section-specific overlay menu */}
			<MobileOverlay isOpen={isMenuOpen} onClose={closeMenu}>
				<div className="flex flex-col max-h-[85vh]">
					<div className="flex items-center justify-between p-4 border-b">
						<div className="flex items-center gap-2">
							<h2 className="font-semibold text-lg">{sectionTitle}</h2>
						</div>
						<Button variant="ghost" size="icon" onClick={closeMenu}>
							<X className="h-5 w-5" />
						</Button>
					</div>

					<div className="flex-1 overflow-y-auto p-4">
						<nav className="space-y-2">
							{/* Overview link for the current section */}
							{currentSection && (
								<Link
									to={currentSection.url}
									onClick={closeMenu}
									className="flex items-center py-3 px-4 rounded-md text-lg font-medium hover:bg-accent"
									activeOptions={{ exact: true }}
									activeProps={{
										className: "bg-accent text-accent-foreground",
									}}
								>
									{currentSection.rootName || "Overview"}
								</Link>
							)}

							{/* Section-specific navigation items */}
							{sectionNavItems.map((item) => (
								<Link
									key={item.title}
									to={item.url}
									onClick={closeMenu}
									className="flex items-center py-3 px-4 rounded-md text-lg font-medium hover:bg-accent"
									activeOptions={{ exact: true }}
									activeProps={{
										className: "bg-accent text-accent-foreground",
									}}
								>
									{item.title}
								</Link>
							))}
						</nav>
					</div>
				</div>
			</MobileOverlay>
		</>
	);
}

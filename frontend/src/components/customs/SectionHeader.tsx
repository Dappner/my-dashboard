import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export default function SectionHeader({
	title,
	linkTo,
	linkText,
}: {
	title: string;
	linkTo?: string;
	linkText?: string;
}) {
	return (
		<div className="flex justify-between items-center mb-2 h-8 px-2 sm:px-0">
			<h2 className="text-lg font-semibold text-gray-900">{title}</h2>
			{linkTo && linkText && (
				<Link
					to={linkTo}
					viewTransition
					className="text-sm text-blue-600 flex items-center hover:underline cursor-pointer"
				>
					{linkText} <ChevronRight className="h-4 w-4" />
				</Link>
			)}
		</div>
	);
}

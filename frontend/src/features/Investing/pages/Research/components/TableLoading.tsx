import { Loader2 } from "lucide-react"; // Import Loader2 icon from lucide-react
import type React from "react";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface TableLoadingProps {
	isLoaded: boolean;
	children: ReactNode;
	className?: string;
}

export const TableLoading: React.FC<TableLoadingProps> = ({
	isLoaded,
	children,
	className,
}) => {
	return (
		<div className={twMerge("relative w-full", className)}>
			{/* Actual table with fade in animation */}
			<div
				className={`w-full transition-opacity duration-500 ease-in-out ${
					isLoaded ? "opacity-100" : "opacity-0"
				}`}
			>
				{children}
			</div>

			{/* Loading overlay with spinner */}
			{!isLoaded && (
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="w-full h-full backdrop-blur-sm bg-white/80 rounded-md border">
						<div className="absolute inset-0 flex items-center justify-center">
							<Loader2 className="h-8 w-8 text-gray-700 animate-spin" />
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

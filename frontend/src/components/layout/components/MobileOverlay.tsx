import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface MobileOverlayProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export function MobileOverlay({
	isOpen,
	onClose,
	children,
}: MobileOverlayProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.5 }}
						className="fixed inset-0 z-40 bg-black/40"
						onClick={onClose}
					/>

					{/* Content */}
					<motion.div
						initial={{ y: "-100%" }}
						animate={{ y: 0 }}
						exit={{ y: "-100%" }}
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
						className={cn(
							"fixed inset-x-0 top-0 z-50 max-h-[85vh] bg-gradient-to-b from-white to-blue-50 shadow-lg overflow-auto",
						)}
					>
						{children}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

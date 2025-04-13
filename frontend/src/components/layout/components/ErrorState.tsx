export default function ErrorState({
	message = "Error loading",
}: { message?: string }) {
	return (
		<div className="flex items-center justify-center h-96 min-h-[384px] bg-background rounded-lg shadow-sm border p-4">
			<span className="text-destructive text-center">{message}</span>
		</div>
	);
}

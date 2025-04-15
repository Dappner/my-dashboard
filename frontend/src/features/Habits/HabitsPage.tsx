import { PageContainer } from "@/components/layout/components/PageContainer";
import { ListChecks } from "lucide-react";

export default function HabitsPage() {
	return (
		<PageContainer>
			<div className="p-16 relative block w-full rounded-lg border-2 border-dashed border-gray-300 text-center ">
				<ListChecks className="mx-auto size-12 text-gray-400" />
				<span className="mt-2 block text-sm font-semibold text-gray-900">
					Working on it!!
				</span>
			</div>
		</PageContainer>
	);
}

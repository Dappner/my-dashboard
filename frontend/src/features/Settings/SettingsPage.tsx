import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
	return (
		<Tabs defaultValue="portfolio" className="w-full max-w-md mx-auto">
			<TabsList className="grid w-full grid-cols-1">
				<TabsTrigger value="portfolio">Settings</TabsTrigger>
			</TabsList>
			<TabsContent value="portfolio" />
		</Tabs>
	);
}

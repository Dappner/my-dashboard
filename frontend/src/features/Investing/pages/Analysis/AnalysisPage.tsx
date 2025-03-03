import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllocationTab from "./tabs/AllocationTab";
import RiskTab from "./tabs/RiskTab";
import DividendTab from "./tabs/DividendTab";

export default function AnalysisPage() {

  return (
    <div className="space-y-6">
      <Tabs defaultValue="allocation">
        <TabsList>
          <TabsTrigger value="allocation" className="cursor-pointer">Allocation</TabsTrigger>
          <TabsTrigger value="dividends" className="cursor-pointer">Dividends</TabsTrigger>
          <TabsTrigger value="risk" className="cursor-pointer">Risk</TabsTrigger>
        </TabsList>
        <TabsContent value="allocation">
          <AllocationTab />
        </TabsContent>
        <TabsContent value="dividends">
          <DividendTab />
        </TabsContent>
        <TabsContent value="risk">
          <RiskTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

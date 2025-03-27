import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllocationTab from "./tabs/AllocationTab";
import RiskTab from "./tabs/RiskTab";
import DividendTab from "./tabs/DividendTab";
import OverviewTab from "./tabs/OverviewTab";
import { PageContainer } from "@/components/layout/components/PageContainer";

export default function HoldingsPage() {
  return (
    <PageContainer>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="cursor-pointer">
            Overview
          </TabsTrigger>
          <TabsTrigger value="allocation" className="cursor-pointer">
            Allocation
          </TabsTrigger>
          <TabsTrigger value="dividends" className="cursor-pointer">
            Dividends
          </TabsTrigger>
          <TabsTrigger value="risk" className="cursor-pointer">
            Risk
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
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
    </PageContainer>
  );
}

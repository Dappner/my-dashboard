import { portfoliosApi, portfoliosApiKey } from "@/api/portfoliosApi";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function SettingsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

  const { data: portfolios, isLoading } = useQuery({
    queryFn: portfoliosApi.fetchAll,
    queryKey: portfoliosApiKey.all
  })

  const onAddPortfolio = () => {
    setSelectedPortfolio(null);
    setIsSheetOpen(true);
  }

  return (
    <>
      <Tabs defaultValue="portfolio">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>
        <TabsContent value="portfolio">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-row justify-between space-x-4">
              <Button onClick={onAddPortfolio}>Add</Button>
            </div>
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Cash</TableHead>
                    <TableHead>Currency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <>Loading</>
                  ) : portfolios?.map((portfolio) => (
                    <TableRow>
                      <TableCell>{portfolio.name}</TableCell>
                      <TableCell>BIg BUCKS</TableCell>
                      <TableCell>{portfolio.cash}</TableCell>
                      <TableCell>{portfolio.currency}</TableCell>
                    </TableRow>
                  ))
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}

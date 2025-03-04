import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { portfoliosApi, portfoliosApiKey } from "@/api/portfoliosApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: portfolio, isLoading } = useQuery({
    queryFn: () => portfoliosApi.fetchUserPortfolio(user!.id),
    queryKey: portfoliosApiKey.all,
    enabled: !!user

  });

  // Mutation for updating portfolio
  const updatePortfolioMutation = useMutation({
    mutationFn: (updatedPortfolio) => portfoliosApi.updatePortfolio(updatedPortfolio),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: portfoliosApiKey.all });
    }
  });

  // Local state for editing
  const [editedPortfolio, setEditedPortfolio] = useState(null);

  // If loading, return null
  if (isLoading) return null;


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPortfolio(prev => ({
      ...prev || portfolio,
      [name]: name === 'cash' ? parseFloat(value) : value
    }));
  };

  // Handle save
  const handleSave = () => {
    if (editedPortfolio) {
      updatePortfolioMutation.mutate(editedPortfolio);
    }
  };

  return (
    <Tabs defaultValue="portfolio" className="w-full max-w-md mx-auto">
      <TabsList className="grid w-full grid-cols-1">
        <TabsTrigger value="portfolio">Portfolio Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="portfolio">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Portfolio Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={portfolio!.name!}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="cash">Cash Balance</Label>
                <div className="flex items-center mt-2">
                  <Input
                    id="cash"
                    name="cash"
                    type="number"
                    step="0.01"
                    defaultValue={portfolio?.cash}
                    onChange={handleInputChange}
                    className="flex-grow"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {portfolio?.currency}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={!editedPortfolio}
                className="w-full mt-4"
              >
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

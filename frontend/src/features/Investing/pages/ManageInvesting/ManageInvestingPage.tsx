import { Button } from "@/components/ui/button";
import {
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  TickerForm,
  TickerFormValues,
} from "@/features/Investing/forms/TickerForm";
import { useTicker } from "@/features/Investing/hooks/useTickers";
import { InsertTicker, Ticker } from "@/types/tickerTypes";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TickerTable from "./components/TickerTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TickerSelect } from "../../forms/FormControls";
import useUser from "@/hooks/useUser";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const trackingFormSchema = z.object({
  ticker_id: z.string().min(1, "Please select a ticker"),
});

type TrackingFormValues = z.infer<typeof trackingFormSchema>;

export default function ManageInvestingPage() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingTicker, setEditingTicker] = useState<Ticker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    tickers,
    isLoading,
    addTicker,
    updateTicker,
    deleteTicker,
    isAdding,
    isUpdating,
  } = useTicker({
    onAddSuccess: () => {
      setIsAddSheetOpen(false);
    },
    onUpdateSuccess: () => {
      setEditingTicker(null);
    },
    onError: (error) => {
      console.error("An error occurred:", error);
      toast.error(`An error occurred: ${error.message}`);
    },
  });
  const { user, updateUser } = useUser();

  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      ticker_id: user?.tracking_ticker_id || "",
    },
  });

  const handleSubmitTicker = (values: TickerFormValues) => {
    if (editingTicker) {
      updateTicker({ id: editingTicker.id, ...values });
    } else {
      addTicker(values as InsertTicker);
    }
  };

  const onDeleteTicker = (id: string) => {
    if (confirm("Are you sure you want to delete this ticker?")) {
      deleteTicker(id);
    }
  };

  const onEditTicker = (ticker: Ticker) => {
    setEditingTicker(ticker);
  };

  const onTrackingSubmit = async (data: TrackingFormValues) => {
    try {
      console.log("ATTEMPT")
      updateUser({
        id: user!.id,
        tracking_ticker_id: data.ticker_id,
      });
      toast.success("Tracking ticker updated successfully");
    } catch (error) {
      toast.error("Failed to update tracking ticker");
      console.error("Error updating tracking ticker:", error);
    }
  };
  const handleCloseEditSheet = () => {
    setEditingTicker(null);
  };

  // Filter tickers based on search query
  const filteredTickers = tickers?.filter(
    (ticker) =>
      ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticker.name &&
        ticker.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ticker.exchange &&
        ticker.exchange.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ticker.sector &&
        ticker.sector.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tickers">
        <TabsList >
          <TabsTrigger value="tickers" className="cursor-pointer">Tickers</TabsTrigger>
          <TabsTrigger value="tracking" className="cursor-pointer">Tracking</TabsTrigger>
        </TabsList>
        <TabsContent value="tickers">

          <div className="flex items-center justify-between">
            <div className="pb-4">
              <CardTitle className="text-2xl">Manage Investment Tickers</CardTitle>
              <CardDescription>
                Add, edit, and remove tickers that you want to track for
                investment purposes.
              </CardDescription>
            </div>
            <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
              <SheetTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Ticker
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Add New Ticker</SheetTitle>
                  <SheetDescription>
                    Enter the details of the stock or investment vehicle you
                    want to track.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <TickerForm
                    onSubmit={handleSubmitTicker}
                    onCancel={() => setIsAddSheetOpen(false)}
                    isSubmitting={isAdding}
                    isEditing={false}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="mb-6">
            <Input
              placeholder="Search tickers by symbol, name, exchange or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTickers && filteredTickers.length > 0 ? (
            <div className="rounded-md border">
              <TickerTable
                filteredTickers={filteredTickers}
                onEditTicker={onEditTicker}
                onDeleteTicker={onDeleteTicker}
                editingTicker={editingTicker}
                isUpdating={isUpdating}
                handleSubmitTicker={handleSubmitTicker}
                handleCloseEditSheet={handleCloseEditSheet}
              />
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? "No tickers matching your search" : "No tickers added yet"}
              </p>
              {!searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsAddSheetOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add your first ticker
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="tracking">
          <div className="space-y-4 max-w-md">
            <div>
              <CardTitle className="text-xl">Configure Tracking Ticker</CardTitle>
              <CardDescription>
                Select a ticker to use as your primary tracking index
              </CardDescription>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onTrackingSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="ticker_id"
                  render={({ field }) => (
                    <FormItem >
                      <FormLabel>Tracking Ticker</FormLabel>
                      <FormControl>
                        <TickerSelect
                          field={field}
                          isLoading={isLoading}
                          tickers={tickers}
                          onValueChange={(value: string) => {
                            field.onChange(value);
                            form.handleSubmit(onTrackingSubmit)();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


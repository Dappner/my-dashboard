import { type ReceiptWithItems, receiptsApi } from "@/api/receiptsApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { spendingReceiptDetailRoute } from "@/routes/spending-routes";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  CalendarIcon,
  CoffeeIcon,
  FilmIcon,
  MoreHorizontalIcon,
  ReceiptIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TagIcon,
} from "lucide-react";
import { useState } from "react";

interface ReceiptCardProps {
  receipt: ReceiptWithItems;
}

const getCategoryIcon = (category: string | null) => {
  switch (category) {
    case "Groceries":
      return <ShoppingCartIcon className="size-4" />;
    case "Dining":
      return <CoffeeIcon className="size-4" />;
    case "Shopping":
      return <ShoppingBagIcon className="size-4" />;
    case "Entertainment":
      return <FilmIcon className="size-4" />;
    default:
      return <ReceiptIcon className="size-4" />;
  }
};

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt }) => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const primaryCategory = receipt.items[0]?.category_name || "Uncategorized";
  const totalSavings =
    receipt.total_discount ||
    receipt.items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
  const formattedDate = format(new Date(receipt.purchase_date), "PP");

  const handleViewDetails = () => {
    navigate({
      to: spendingReceiptDetailRoute.to,
      params: { receiptId: receipt.receipt_id },
    });
  };

  const handleOpenImage = async () => {
    if (!imageUrl && receipt.receipt_image_path) {
      try {
        const url = await receiptsApi.getReceiptImageUrl(
          receipt.receipt_image_path,
        );
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to load image:", error);
      }
    }
    setIsImageOpen(true);
  };

  return (
    <Card className="overflow-hidden border border-accent rounded-lg h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-accent">
        <div className="flex justify-between items-start sm:items-center">
          <div className="flex items-center gap-3">
            <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
              <DialogTrigger asChild>
                <Avatar
                  className="h-10 w-10 cursor-pointer"
                  onClick={handleOpenImage}
                >
                  <AvatarImage
                    src={receipt.imageUrl || ""}
                    alt={receipt.store_name || undefined}
                  />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {receipt.store_name?.substring(0, 2) || "??"}
                  </AvatarFallback>
                </Avatar>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-md">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`Receipt from ${receipt.store_name}`}
                  />
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Loading image...</span>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <div>
              <h3 className="text-lg font-bold text-primary line-clamp-1">
                {receipt.store_name || "Unknown"}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {formattedDate}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="flex items-center gap-1 py-1 px-2 text-xs ml-2 shrink-0"
          >
            {getCategoryIcon(primaryCategory)}
            {primaryCategory}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-muted-foreground">
            {receipt.items.length}
            {receipt.items.length === 1 ? " item" : " items"}
          </span>
          <div className="text-right">
            {totalSavings > 0 && (
              <div className="text-success-foreground text-xs flex items-center justify-end gap-1">
                <TagIcon className="size-3" />
                {receipt.currency_code}
                {totalSavings.toFixed(2)}
              </div>
            )}
            <span className="text-lg font-bold text-primary">
              {receipt.currency_code}
              {receipt.total_amount.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          {receipt.items.slice(0, 3).map((item) => (
            <div
              key={item.item_id}
              className="flex justify-between items-center"
            >
              <span className="truncate flex-1">{item.readable_name}</span>
              <span className="font-medium ml-2 shrink-0">
                {receipt.currency_code}
                {item.unit_price.toFixed(2)}
              </span>
            </div>
          ))}
          {receipt.items.length > 3 && (
            <div className="text-muted-foreground text-xs text-center">
              +{receipt.items.length - 3} more
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 flex justify-between border-t border-accent mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="text-xs w-full sm:w-auto"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
        <Button variant="ghost" size="icon" className="size-8 ml-2">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export { getCategoryIcon };

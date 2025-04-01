import type { ReceiptWithItems } from "@/api/receiptsApi";
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
      return <ShoppingCartIcon className="h-4 w-4" />;
    case "Dining":
      return <CoffeeIcon className="h-4 w-4" />;
    case "Shopping":
      return <ShoppingBagIcon className="h-4 w-4" />;
    case "Entertainment":
      return <FilmIcon className="h-4 w-4" />;
    default:
      return <ReceiptIcon className="h-4 w-4" />;
  }
};

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const primaryCategory = receipt.items[0]?.category_name || "Uncategorized";
  const totalSavings = receipt.total_discount ||
    receipt.items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
  const formattedDate = format(new Date(receipt.purchase_date), "PP");

  const ReceiptDetails = () => (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center gap-3">
        <Avatar
          className="h-12 w-12 cursor-pointer"
          onClick={() => setIsImageOpen(true)}
        >
          <AvatarImage
            src={receipt.imageUrl || ""}
            alt={receipt.store_name || undefined}
          />
          <AvatarFallback className="bg-blue-500 text-white">
            {receipt.store_name?.substring(0, 2) || "??"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {receipt.store_name}
          </h2>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {formattedDate}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800">Items</h3>
        {receipt.items.map((item) => (
          <div key={item.item_id} className="flex justify-between text-sm">
            <span className="truncate flex-1">{item.readable_name}</span>
            <span className="font-medium">
              {item.quantity > 1 ? `${item.quantity}x ` : ""}
              {receipt.currency_code}
              {item.unit_price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-3 border-t border-gray-200">
        {totalSavings > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Savings</span>
            <span>
              {receipt.currency_code}
              {totalSavings.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-gray-600 text-sm">
          <span>Subtotal</span>
          <span>
            {receipt.currency_code}
            {(receipt.total_amount + totalSavings).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-gray-800 font-medium pt-2 border-t border-gray-100">
          <span>Total</span>
          <span className="text-lg">
            {receipt.currency_code}
            {receipt.total_amount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden border border-gray-200 rounded-lg">
      <CardHeader className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
              <DialogTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer">
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
                <img
                  src={receipt.imageUrl || ""}
                  alt={`Receipt from ${receipt.store_name}`}
                  className="w-full rounded-lg"
                />
              </DialogContent>
            </Dialog>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {receipt.store_name || "Unknown"}
              </h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {formattedDate}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="flex items-center gap-1 py-1 px-2 text-xs"
          >
            {getCategoryIcon(primaryCategory)}
            {primaryCategory}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-gray-600">
            {receipt.items.length}{" "}
            {receipt.items.length === 1 ? "item" : "items"}
          </span>
          <div className="text-right">
            {totalSavings > 0 && (
              <div className="text-green-600 text-xs flex items-center justify-end gap-1">
                <TagIcon className="h-3 w-3" />
                {receipt.currency_code}
                {totalSavings.toFixed(2)}
              </div>
            )}
            <span className="text-lg font-bold text-gray-900">
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
              <span className="font-medium">
                {receipt.currency_code}
                {item.unit_price.toFixed(2)}
              </span>
            </div>
          ))}
          {receipt.items.length > 3 && (
            <div className="text-gray-500 text-xs text-center">
              +{receipt.items.length - 3} more
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 flex justify-between border-t border-gray-100">
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-md">
            <ReceiptDetails />
          </DialogContent>
        </Dialog>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export { getCategoryIcon };

import { ReceiptWithItems } from "@/api/receiptsApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
import { format } from "date-fns";
import { useState } from "react";

interface ReceiptCardProps {
  receipt: ReceiptWithItems;
}

const getCategoryIcon = (category: string | null) => {
  switch (category) {
    case "Groceries":
      return <ShoppingCartIcon className="size-5" />;
    case "Dining":
      return <CoffeeIcon className="size-5" />;
    case "Shopping":
      return <ShoppingBagIcon className="size-5" />;
    case "Entertainment":
      return <FilmIcon className="size-5" />;
    case "Fruits & Vegetables":
      return <ShoppingCartIcon className="size-5 text-green-600" />;
    case "Sweets & Desserts":
      return <CoffeeIcon className="size-5 text-pink-500" />;
    case "Pasta & Rice":
      return <ShoppingBagIcon className="size-5 text-yellow-600" />;
    case "Baby Products":
      return <ShoppingCartIcon className="size-5 text-blue-500" />;
    default:
      return <ReceiptIcon className="size-5" />;
  }
};

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const primaryCategory = receipt.items[0]?.category_name || "Uncategorized";

  // Calculate savings
  const totalSavings = receipt.total_discount ||
    receipt.items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);

  // Get formatted date
  const formattedDate = format(new Date(receipt.purchase_date), "PPP");

  // Group items by category for better presentation
  const itemsByCategory = receipt.items.reduce((acc, item) => {
    const category = item.category_name || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof receipt.items>);

  const ReceiptDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar
          className="h-16 w-16 border-2 border-white shadow-md cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setIsImageOpen(true)}
        >
          <AvatarImage
            src={receipt.imageUrl || undefined}
            alt={receipt.store_name!}
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold">
            {receipt.store_name?.substring(0, 2) || "??"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {receipt.store_name}
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <CalendarIcon className="h-4 w-4" />
            {formattedDate}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5">
        <h3 className="font-semibold text-gray-800 mb-4 text-lg">
          Items Purchased
        </h3>

        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {getCategoryIcon(category)}
              <h4 className="text-base font-medium text-gray-700">
                {category}
              </h4>
            </div>
            <ul className="space-y-4 pl-6">
              {items.map((item) => (
                <li
                  key={item.item_id}
                  className="flex justify-between items-center"
                >
                  <div className="flex-1">
                    <span className="text-gray-800">{item.readable_name}</span>
                    {item.is_discounted && (
                      <Badge
                        variant="outline"
                        className="ml-2 text-green-600 border-green-300 text-xs"
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        Saved {receipt.currency_code}
                        {item.discount_amount.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right min-w-32">
                    {item.is_discounted && (
                      <span className="line-through text-gray-400 mr-2">
                        {receipt.currency_code}
                        {item.original_unit_price.toFixed(2)}
                      </span>
                    )}
                    <span className="font-medium">
                      {item.quantity > 1 ? `${item.quantity} x ` : ""}
                      {receipt.currency_code}
                      {item.unit_price.toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-5">
        <div className="space-y-3">
          {totalSavings > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>Total Savings</span>
              <span className="font-medium">
                {receipt.currency_code}
                {totalSavings.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-gray-600">
            <span>Subtotal</span>
            <span>
              {receipt.currency_code}
              {(receipt.total_amount + totalSavings).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className="text-gray-800 font-medium">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {receipt.currency_code}
              {receipt.total_amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const ReceiptImage = () => (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md rounded-lg overflow-hidden shadow-xl">
        {receipt.imageUrl
          ? (
            <img
              src={receipt.imageUrl}
              alt={`Receipt from ${receipt.store_name}`}
              className="w-full object-contain"
            />
          )
          : (
            <div className="flex items-center justify-center bg-gray-100 h-64 w-full">
              <span className="text-gray-400">No receipt image available</span>
            </div>
          )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={() => setIsImageOpen(false)}
      >
        Close
      </Button>
    </div>
  );

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-xl">
      <CardHeader className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
              <DialogTrigger asChild>
                <Avatar className="h-14 w-14 border-2 border-white shadow-md cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage
                    src={receipt.imageUrl || undefined}
                    alt={receipt.store_name!}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg font-bold">
                    {receipt.store_name?.substring(0, 2) || "??"}
                  </AvatarFallback>
                </Avatar>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <ReceiptImage />
              </DialogContent>
            </Dialog>
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                {receipt.store_name || "Unknown Store"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <CalendarIcon className="h-4 w-4" />
                {formattedDate}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="flex items-center gap-2 py-2 px-3 bg-gray-50 text-gray-700 rounded-lg"
          >
            {getCategoryIcon(primaryCategory)}
            {primaryCategory}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            {receipt.items.length}{" "}
            {receipt.items.length === 1 ? "item" : "items"}
          </span>
          <div className="text-right">
            {totalSavings > 0 && (
              <div className="text-green-600 text-sm font-medium mb-1 flex items-center justify-end gap-1">
                <TagIcon className="h-4 w-4" />
                Saved {receipt.currency_code}
                {totalSavings.toFixed(2)}
              </div>
            )}
            <span className="text-xl font-bold text-gray-900">
              {receipt.currency_code}
              {receipt.total_amount.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-700 space-y-4">
          {receipt.items.slice(0, 3).map((item) => (
            <div
              key={item.item_id}
              className="flex justify-between items-center pb-3 border-b border-gray-100"
            >
              <div className="flex items-center gap-2 truncate max-w-[60%]">
                {getCategoryIcon(item.category_name)}
                <span className="truncate">
                  {item.readable_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.is_discounted && (
                  <span className="text-green-600 text-xs font-medium">
                    -{item.discount_amount.toFixed(2)}
                  </span>
                )}
                <span className="font-medium">
                  {item.quantity > 1 ? `${item.quantity} x ` : ""}
                  {receipt.currency_code}
                  {item.unit_price.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          {receipt.items.length > 3 && (
            <div className="text-gray-500 italic text-center mt-2 pt-2">
              +{receipt.items.length - 3} more items
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 flex justify-between border-t border-gray-100">
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="text-gray-700 border-gray-300 hover:bg-gray-50 font-medium"
            >
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <ReceiptDetails />
          </DialogContent>
        </Dialog>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full"
        >
          <MoreHorizontalIcon className="size-5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export { getCategoryIcon };

import type { ReceiptWithItems } from "@/api/receiptsApi";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { EyeIcon, ShoppingBagIcon } from "lucide-react";

interface ReceiptImageProps {
  receipt: ReceiptWithItems;
  isImageOpen: boolean;
  setIsImageOpen: (open: boolean) => void;
}

export default function ReceiptImage({
  receipt,
  isImageOpen,
  setIsImageOpen,
}: ReceiptImageProps) {
  return (
    <div className="flex flex-col gap-4">
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogTrigger asChild>
          <div className="relative aspect-video">
            {receipt.imageUrl ? (
              <img
                src={receipt.imageUrl}
                alt={`Receipt from ${receipt.store_name || "store"}`}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <ShoppingBagIcon className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center">
              <EyeIcon className="h-6 w-6 text-white opacity-0 hover:opacity-100" />
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          {receipt.imageUrl ? (
            <img
              src={receipt.imageUrl}
              alt={`Receipt from ${receipt.store_name || "store"}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black/80">
              <ShoppingBagIcon className="h-24 w-24 text-white/30" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

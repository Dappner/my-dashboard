import { TransactionType } from "@/types/transactionsTypes";

export const getTradeTypeStyles = (type: TransactionType) => {
  switch (type) {
    case 'buy':
      return {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 border-green-200'
      };
    case 'sell':
      return {
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 border-red-200'
      };
    case 'dividend':
      return {
        variant: 'secondary' as const,
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    default:
      return {
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-800'
      };
  }
};


export const getCashflowStyles = (type: TransactionType) => {
  if (type === "buy" || type === "withdraw") {
    return "text-red-600";
  } else {
    return "text-green-700";
  }
}

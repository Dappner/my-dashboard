import { useState } from 'react';
import { useTransactions } from './useTransactions';
import { format } from 'date-fns';

export const useCashTransaction = (userId: string) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addTrade } = useTransactions();

  const openCashTransactionDialog = () => setIsDialogOpen(true);
  const closeCashTransactionDialog = () => setIsDialogOpen(false);

  const handleCashTransaction = async (data: {
    transactionType: 'deposit' | 'withdrawal';
    amount: number;
    note?: string;
  }) => {
    return new Promise<boolean>((resolve, reject) => {
      // Prepare transaction data for your database
      const transactionData = {
        user_id: userId,
        transaction_type: data.transactionType,
        shares: data.amount, // Using shares field for cash amount
        price_per_share: 1, // Fixed at 1 for cash transactions
        note_text: data.note,
        transaction_date: format(new Date(), "yyyy-MM-dd"),
      };

      // Use addTrade mutation with success and error callbacks
      addTrade(transactionData, {
        onSuccess: () => {
          resolve(true);
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  };

  return {
    isDialogOpen,
    openCashTransactionDialog,
    closeCashTransactionDialog,
    handleCashTransaction
  };
};

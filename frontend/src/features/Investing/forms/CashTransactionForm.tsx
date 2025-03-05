import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '../hooks/useTransactions';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema for validation
const cashTransactionSchema = z.object({
  transactionType: z.enum(['deposit', 'withdrawal']),
  amount: z.coerce.number().positive('Amount must be greater than 0').max(1000000, 'Amount too large'),
  note: z.string().optional()
});

interface CashTransactionFormProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CashTransactionForm: React.FC<CashTransactionFormProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const { addTrade } = useTransactions();

  const form = useForm<z.infer<typeof cashTransactionSchema>>({
    resolver: zodResolver(cashTransactionSchema),
    defaultValues: {
      transactionType: 'deposit',
      amount: undefined,
      note: ''
    }
  });

  const handleSubmit = (data: z.infer<typeof cashTransactionSchema>) => {
    // Prepare transaction data for your database
    const transactionData = {
      user_id: userId,
      transaction_type: data.transactionType,
      shares: data.amount, // Using shares field for cash amount
      price_per_share: 1, // Fixed at 1 for cash transactions
      note_text: data.note,
      transaction_date: format(new Date(), "yyyy-MM-dd"),
    };

    // Use addTrade mutation from useTransactions
    addTrade(transactionData, {
      onSuccess: () => {
        form.reset();
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cash Transaction</DialogTitle>
          <DialogDescription>
            Deposit or withdraw funds from your trading account
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the amount to deposit or withdraw
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add a note about this transaction"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Processing...' : 'Submit Transaction'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CashTransactionForm;

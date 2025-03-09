import { supabase } from '@/lib/supabase'
import { HoldingAllocation } from '@/types/holdingsTypes'
import { useQuery } from '@tanstack/react-query'

export const useHoldingsAllocation = () => {
  const { data, isLoading, error } = useQuery<HoldingAllocation[]>({
    queryKey: ['holdings_allocation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_holdings_allocation')
        .select('*')
      // Add user_id filter if needed
      // .eq('user_id', currentUserId)

      if (error) throw new Error(error.message)
      return data
    },
  })

  return {
    holdingsAllocation: data,
    isLoading,
    error,
  }
}

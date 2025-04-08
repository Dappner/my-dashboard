import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";

export function useHoldings() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ["holdings", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("holdings")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

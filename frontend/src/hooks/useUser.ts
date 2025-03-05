import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export default function useUser() {
  const { user: authUser } = useAuthContext();
  const { data: user, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await supabase.from("users").select()
        .eq("id", authUser!.id)
        .single();
      return data;
    },
    queryKey: ["user"],
    enabled: !!authUser
  });

  return {
    user,
    isLoading
  }
}

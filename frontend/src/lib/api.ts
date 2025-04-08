import { createApi, createServices, queryKeys } from "@my-dashboard/shared";
import { supabase } from "./supabase";

// Initialize API with supabase client
export const api = createApi(supabase);

// Initialize services with the API
export const services = createServices(api);

// Export query keys for React Query
export { queryKeys };

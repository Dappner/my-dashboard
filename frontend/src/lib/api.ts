import { createApi, createServices } from "@my-dashboard/shared";

import { supabase } from "./supabase";

// Initialize API with supabase client
export const api = createApi(supabase);

// Initialize services with the API
export const services = createServices();

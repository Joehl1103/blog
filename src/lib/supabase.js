import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zmplxklzsjkuipttflnd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FQ4zyYzEFnEc51EtTx_S2w_k2iKIOlY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

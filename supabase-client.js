/* Supabase client — loaded via CDN in index.html */
const SUPABASE_URL = "https://zmplxklzsjkuipttflnd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FQ4zyYzEFnEc51EtTx_S2w_k2iKIOlY";

/* CDN attaches to window.supabase — rename the client to avoid shadowing */
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

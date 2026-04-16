/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly SUPABASE_URL: string
    readonly SUPABASE_ANON_KEY: string
    readonly SUPABASE_APPOINTMENTS_TABLE: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

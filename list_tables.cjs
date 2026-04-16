const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lskzamecqaeatgemjyvp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza3phbWVjcWFlYXRnZW1qeXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTAxMjAsImV4cCI6MjA4ODg4NjEyMH0.kl8hWYV6v8v_XQoSoQQRrp5z33pYWgmpytVxRqXUt5I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    console.log('Listing all tables from information_schema...');
    try {
        // This query works on Supabase if the user has permissions, but might be blocked for anon key.
        // Let's try to query a few more common names first or use a broader approach.
        const { data, error } = await supabase.rpc('get_tables'); // Sometimes there's a helper function
        if (error) {
            console.log('RPC get_tables error:', error.message);
            // Fallback: try to select from information_schema.tables directly via rpc if possible or just try more names.
            const commonNames = ['calls', 'call_records', 'call_logs', 'logs', 'conversations', 'transcripts', 'call_transcripts'];
            for (const name of commonNames) {
                const { error: err } = await supabase.from(name).select('*').limit(1);
                if (!err) {
                    console.log(`Found table: ${name}`);
                }
            }
        } else {
            console.log('Tables:', data);
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

listTables();

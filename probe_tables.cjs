const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lskzamecqaeatgemjyvp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza3phbWVjcWFlYXRnZW1qeXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTAxMjAsImV4cCI6MjA4ODg4NjEyMH0.kl8hWYV6v8v_XQoSoQQRrp5z33pYWgmpytVxRqXUt5I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function probeTables() {
    const tables = ['call_logs', 'call_records', 'calls', 'call_data', 'appointments'];
    for (const table of tables) {
        console.log(`Probing table: ${table}...`);
        try {
            const { data, error } = await supabase.from(table).select('*').limit(3);
            if (error) {
                console.log(`Table ${table} error:`, error.message);
            } else {
                console.log(`Table ${table} exists! Count: ${data?.length}`);
                if (data && data.length > 0) {
                    console.log(`Sample data from ${table}:`, JSON.stringify(data[0], null, 2));
                }
            }
        } catch (e) {
            console.log(`Table ${table} exception:`, e.name, e.message);
        }
    }
}

probeTables();

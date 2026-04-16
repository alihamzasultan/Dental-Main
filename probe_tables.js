const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function probeTables() {
    const tables = ['call_logs', 'call_records', 'calls'];
    for (const table of tables) {
        console.log(`Probing table: ${table}...`);
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.log(`Table ${table} error:`, error.message);
            } else {
                console.log(`Table ${table} exists! Data:`, data);
            }
        } catch (e) {
            console.log(`Table ${table} exception:`, e.message);
        }
    }
}

probeTables();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
    // Try to fetch one row to see columns
    const { data, error } = await supabase
        .from('weekly_hours')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching weekly_hours:', error);
    } else {
        console.log('Successfully fetched from weekly_hours:', data);
    }
}

checkTable();

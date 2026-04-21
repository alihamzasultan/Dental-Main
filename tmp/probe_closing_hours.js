const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
    const { data, error } = await supabase
        .from('closing_hours')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching closing_hours:', error);
    } else {
        console.log('Successfully fetched from closing_hours:', data);
    }
}

checkTable();

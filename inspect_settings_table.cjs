const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    console.log('Inspecting table: timings_and_settings...');
    const { data, error } = await supabase.from('timings_and_settings').select('*').limit(1);
    
    if (error) {
        console.error('Error fetching from timings_and_settings:', error.message);
        if (error.code === '42P01') {
            console.log('Table timings_and_settings does not exist.');
        }
    } else {
        console.log('Success! Data found:');
        console.log(JSON.stringify(data, null, 2));
        if (data && data.length > 0) {
            console.log('\nColumns found:', Object.keys(data[0]).join(', '));
        } else {
            console.log('Table is empty, cannot determine columns from data.');
            // Try to use a query that returns columns even if empty
            // Note: anon key might not have permission for information_schema
        }
    }
}

inspectTable();

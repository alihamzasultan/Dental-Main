const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableAutomation() {
    console.log('Checking for automation columns in timings_and_settings...');
    const { data, error } = await supabase.from('timings_and_settings').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Row data:', data);
        if (data && data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]).join(', '));
        }
    }
}

checkTableAutomation();

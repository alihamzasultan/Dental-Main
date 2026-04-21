const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('Checking agent_location_data table...');
    
    // Try with service role key to bypass RLS
    const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const adminClient = createClient(supabaseUrl, serviceKey);
    
    const { data, error } = await adminClient
        .from('agent_location_data')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('SUCCESS - Table exists!');
        if (data && data.length > 0) {
            console.log('Actual columns:', Object.keys(data[0]));
            console.log('Row data:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('Table is empty - checking structure via anon key...');
        }
    }

    // Also test with anon key (what the app uses)
    console.log('\n--- Testing with ANON key (what the app uses) ---');
    const { data: anonData, error: anonError } = await supabase
        .from('agent_location_data')
        .select('id, created_at, location_state, locaion_city, company_name, company_name_small, agent_phone')
        .order('id', { ascending: false });
    
    if (anonError) {
        console.error('Anon key error:', JSON.stringify(anonError, null, 2));
    } else {
        console.log('Anon key SUCCESS - rows:', anonData?.length);
    }
}

checkTable();

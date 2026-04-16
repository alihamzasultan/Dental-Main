
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lskzamecqaeatgemjyvp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza3phbWVjcWFlYXRnZW1qeXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTAxMjAsImV4cCI6MjA4ODg4NjEyMH0.kl8hWYV6v8v_XQoSoQQRrp5z33pYWgmpytVxRqXUt5I');

async function check() {
    const { data, error } = await supabase.from('call_logs').select('*').limit(5);
    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

check();


import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://lskzamecqaeatgemjyvp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza3phbWVjcWFlYXRnZW1qeXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTAxMjAsImV4cCI6MjA4ODg4NjEyMH0.kl8hWYV6v8v_XQoSoQQRrp5z33pYWgmpytVxRqXUt5I');

async function check() {
    const { data: appts, error: err1 } = await supabase.from('appointments').select('*').limit(1);
    console.log('Appointments Columns:', Object.keys(appts?.[0] || {}));
    
    const { data: logs, error: err2 } = await supabase.from('call_logs').select('*').limit(1);
    console.log('Call Logs Columns:', Object.keys(logs?.[0] || {}));
    if (logs?.[0]) console.log('Call Logs Sample:', logs[0]);
}

check();

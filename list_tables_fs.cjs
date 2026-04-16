const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://lskzamecqaeatgemjyvp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza3phbWVjcWFlYXRnZW1qeXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTAxMjAsImV4cCI6MjA4ODg4NjEyMH0.kl8hWYV6v8v_XQoSoQQRrp5z33pYWgmpytVxRqXUt5I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    let output = '';
    const commonNames = ['calls', 'call_records', 'call_logs', 'logs', 'conversations', 'transcripts', 'call_transcripts', 'history', 'activities'];
    for (const name of commonNames) {
        const { error: err } = await supabase.from(name).select('*').limit(1);
        if (!err) {
            output += `Found table: ${name}\n`;
        } else {
            output += `Table ${name} NOT found or error: ${err.message}\n`;
        }
    }
    fs.writeFileSync('table_found.txt', output);
}

listTables();

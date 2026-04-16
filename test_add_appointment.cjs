const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const appointmentsTable = process.env.VITE_SUPABASE_APPOINTMENTS_TABLE || 'appointments';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

async function testAddAppointment() {
    const newAppointment = {
        patient_name: 'Test Patient',
        phone: '1234567890',
        email: 'test@example.com',
        appointment_time: new Date().toISOString(),
        status: 'booked',
        reason_for_visit: 'Test checkup',
        booking_channel: 'Front Desk',
        location_id: 'clinic-north'
    };

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/${appointmentsTable}`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(newAppointment)
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Failed to add appointment. Error details:');
            console.error(JSON.stringify(data, null, 2));
        } else {
            console.log('Successfully added appointment:', data);
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testAddAppointment();

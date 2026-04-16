import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const appointmentsTable = process.env.VITE_SUPABASE_APPOINTMENTS_TABLE || 'appointments';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

    console.log('Attempting to add appointment:', newAppointment);
    const { data, error } = await supabase
        .from(appointmentsTable)
        .insert([newAppointment])
        .select();

    if (error) {
        console.error('Failed to add appointment. Error details:');
        console.error(JSON.stringify(error, null, 2));
    } else {
        console.log('Successfully added appointment:', data);
    }
}

testAddAppointment();

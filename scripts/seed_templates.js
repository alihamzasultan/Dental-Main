import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lskzamecqaeatgemjyvp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza3phbWVjcWFlYXRnZW1qeXZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMxMDEyMCwiZXhwIjoyMDg4ODg2MTIwfQ.xnPn32h78_lNGC6v8tbbYsVQUUvrQWU8gP3V2Q9JJYo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const templates = [
  {
    template_id: 'appointment_rescheduled',
    template_name: 'Update an event',
    sms_text: "Hi {{ $('Get row(s) in sheet').item.json['Customer Name'] }}, your SmileCraft appointment has been rescheduled to {{ DateTime.fromISO($('Update an event').item.json.start.dateTime).toFormat(\"MMM d, yyyy 'at' h:mm a\") }}. See you then! To cancel, please call us."
  },
  {
    template_id: 'appointment_confirmation',
    template_name: 'Create an event',
    sms_text: "Hi {{ $('Code in JavaScript').item.json.customer_name.charAt(0).toUpperCase() + $('Code in JavaScript').item.json.customer_name.slice(1) }}, your appointment at SmileCraft Family Dental is confirmed for {{ DateTime.fromISO($('Create an event').item.json.start.dateTime).toFormat(\"MMM d, yyyy 'at' h:mm a\") }}. See you soon! To cancel, please call us."
  },
  {
    template_id: 'appointment_cancelled',
    template_name: 'Delete an event',
    sms_text: "Hi, your appointment at SmileCraft Family Dental has been cancelled as requested. Please call us at any time to rebook. We look forward to seeing you!"
  },
  {
    template_id: 'appointment_reminder',
    template_name: 'Dental appointment reminder',
    sms_text: "Hi {{ $json['Customer Name'] }}, this is a friendly reminder from SmileCraft Family Dental & Orthodontics. You have an appointment tomorrow, {{ DateTime.fromISO($json['Booking Date']).toFormat('MMM d, yyyy') }} at {{ DateTime.fromISO($json['Booking Date']).toFormat('h:mm a') }}. Please call us if you need to reschedule.\nReply Y to CONFIRM or N to CANCEL. Thank you!"
  },
  {
    template_id: 'sms_confirmation_success',
    template_name: 'Appointment confirmed via SMS',
    sms_text: "Thank you for confirming your appointment! ✓\n\nWe look forward to seeing you on {{ DateTime.fromISO($('Get row(s) in sheet1').first().json['Booking Date']).toFormat('MMM d') }} at {{ DateTime.fromISO($('Get row(s) in sheet1').first().json['Booking Date']).toFormat('h:mm a') }}."
  },
  {
    template_id: 'sms_cancellation_success',
    template_name: 'Appointment cancelled via SMS',
    sms_text: "We've cancelled your appointment as requested, {{ $('Get row(s) in sheet1').first().json['Customer Name'] }}.\n\nPlease call us when you're ready to reschedule. We hope to see you soon!\n\n- SmileCraft Family Dental & Orthodontics"
  },
  {
    template_id: 'sms_fallback',
    template_name: 'Fallback for appointment response',
    sms_text: "We didn't understand your response. Please reply:\nY - to CONFIRM your appointment\nN - to CANCEL your appointment\n\nThank you!"
  },
  {
    template_id: 'post_visit_feedback',
    template_name: 'Post visit feedback sms',
    sms_text: "Hi {{ $('Get row(s) in sheet').first().json['Customer Name'] }}, thank you for visiting SmileCraft Family Dental today for {{ $('Get row(s) in sheet').first().json['Reason for visit'] }}! We hope everything went well. Could you take 5 seconds to rate your experience? Reply 1 for Great 😊 or Reply 2 if something could be improved. Your feedback means everything to us!"
  },
  {
    template_id: 'positive_feedback',
    template_name: 'Positive feedback',
    sms_text: "That's so great to hear, {{ $('Get row(s) in sheet1').first().json['Customer Name'] }}! 🌟 We'd really appreciate it if you shared your experience — it only takes 30 seconds and helps other families find us: https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review — Thank you for trusting SmileCraft! 😊"
  },
  {
    template_id: 'negative_feedback',
    template_name: 'Negative Feedback',
    sms_text: "Thank you for your honest feedback, {{ $('Get row(s) in sheet1').first().json['Customer Name'] }}. We're truly sorry your visit wasn't perfect. A member of our team will personally reach out to you soon to make it right. We appreciate your patience.\n-SmileCraft Family Dental."
  }
];

async function seed() {
  console.log('Fetching existing templates...');
  const { data: existingTemplates, error: fetchError } = await supabase
    .from('sms_templates')
    .select('*');

  if (fetchError) {
    console.error('Error fetching templates:', fetchError.message);
    return;
  }

  console.log(`Found ${existingTemplates.length} existing templates.`);

  for (const template of templates) {
    const existing = existingTemplates.find(t => t.template_id === template.template_id);
    
    if (existing) {
      console.log(`Updating existing template: ${template.template_id}`);
      const { error: updateError } = await supabase
        .from('sms_templates')
        .update({ 
          sms_text: template.sms_text,
          template_name: template.template_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      
      if (updateError) {
        console.error(`Error updating ${template.template_id}:`, updateError.message);
      }
    } else {
      console.log(`Inserting new template: ${template.template_id}`);
      const { error: insertError } = await supabase
        .from('sms_templates')
        .insert([template]);
      
      if (insertError) {
        console.error(`Error inserting ${template.template_id}:`, insertError.message);
      }
    }
  }
  console.log('Done!');
}

seed();

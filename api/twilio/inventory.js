export default async function handler(req, res) {
  try {
    const sid = process.env.VITE_TWILIO_ACCOUNT_SID;
    const token = process.env.VITE_TWILIO_AUTH_TOKEN;
    const vapiApiKey = process.env.VITE_VAPI_API_KEY;

    if (!sid || !token) {
      return res.status(400).json({ message: "Twilio credentials missing" });
    }

    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    
    const [twilioRes, vapiRes] = await Promise.all([
      fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/IncomingPhoneNumbers.json`, {
        headers: { 'Authorization': `Basic ${auth}` }
      }),
      vapiApiKey ? fetch('https://api.vapi.ai/phone-number', {
        headers: { 'Authorization': `Bearer ${vapiApiKey}` }
      }) : Promise.resolve({ ok: false })
    ]);

    const twilioData = await twilioRes.json();
    const vapiData = vapiRes.ok ? await vapiRes.json() : [];

    res.status(200).json({
      twilio: twilioData.incoming_phone_numbers || [],
      vapi: vapiData
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

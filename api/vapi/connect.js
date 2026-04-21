export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { phoneNumber, assistantId, name } = req.body;
    const vapiApiKey = process.env.VITE_VAPI_API_KEY;
    const twilioSid = process.env.VITE_TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.VITE_TWILIO_AUTH_TOKEN;

    if (!vapiApiKey || !twilioSid || !twilioToken) {
      return res.status(400).json({ message: "Missing API credentials" });
    }

    const headers = { 
      'Authorization': `Bearer ${vapiApiKey}`,
      'Content-Type': 'application/json'
    };

    // Check if exists
    const listRes = await fetch('https://api.vapi.ai/phone-number', { headers });
    const list = await listRes.json();
    const existing = Array.isArray(list) ? list.find((n) => n.number === phoneNumber) : null;

    let final;
    if (existing) {
      const resPatch = await fetch(`https://api.vapi.ai/phone-number/${existing.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ assistantId, name: name || `Agent: ${phoneNumber}` })
      });
      final = await resPatch.json();
      final._reconnected = true;
    } else {
      const resImp = await fetch('https://api.vapi.ai/phone-number/import/twilio', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          twilioPhoneNumber: phoneNumber,
          twilioAccountSid: twilioSid,
          twilioAuthToken: twilioToken,
          name: name || `Agent: ${phoneNumber}`,
          assistantId: assistantId
        })
      });
      final = await resImp.json();
    }

    res.status(200).json(final);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

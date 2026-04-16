export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { phoneNumber } = req.body;
    const sid = process.env.VITE_TWILIO_ACCOUNT_SID;
    const token = process.env.VITE_TWILIO_AUTH_TOKEN;

    if (!sid || !token) {
      return res.status(400).json({ message: "Twilio credentials missing" });
    }

    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/IncomingPhoneNumbers.json`, {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ PhoneNumber: phoneNumber }).toString()
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

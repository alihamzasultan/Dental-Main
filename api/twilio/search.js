export default async function handler(req, res) {
  try {
    const { areaCode, isoCode = 'GB' } = req.query;
    const sid = process.env.VITE_TWILIO_ACCOUNT_SID;
    const token = process.env.VITE_TWILIO_AUTH_TOKEN;

    if (!sid || !token) {
      return res.status(400).json({ message: "Twilio credentials missing" });
    }

    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const twilioUrl = new URL(`https://api.twilio.com/2010-04-01/Accounts/${sid}/AvailablePhoneNumbers/${isoCode}/Local.json`);
    
    if (areaCode && areaCode.length <= 4) {
      twilioUrl.searchParams.append('AreaCode', areaCode);
    } else if (areaCode) {
      twilioUrl.searchParams.append('Contains', areaCode);
    }

    const response = await fetch(twilioUrl.toString(), {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    const data = await response.json();
    
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

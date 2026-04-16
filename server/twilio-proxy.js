import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load .env from the root directory (where npm run server is executed)
dotenv.config(); 

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const TWILIO_SID = process.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.VITE_TWILIO_AUTH_TOKEN;

app.get('/search', async (req, res) => {
    console.log('GET /search - Incoming request', req.query);
    try {
        if (!TWILIO_SID || !TWILIO_TOKEN) {
             console.error('Search aborted: TWILIO_SID or TWILIO_TOKEN missing in .env');
             return res.status(400).json({ message: "Twilio credentials missing in .env" });
        }

        const areaCode = req.query.areaCode || '';
        const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');
        
        const url = new URL(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/AvailablePhoneNumbers/GB/Local.json`);
        if (areaCode) url.searchParams.append('AreaCode', areaCode);

        console.log('Contacting Twilio API:', url.toString());
        const response = await fetch(url.toString(), {
            headers: { 'Authorization': `Basic ${auth}` }
        });

        const data = await response.json();
        console.log('Twilio response status:', response.status);

        if (!response.ok) {
            console.error('Twilio search failed:', data);
            throw new Error(data.message || 'Twilio search failed');
        }

        console.log(`Success: Found ${data.available_phone_numbers?.length || 0} numbers`);
        res.json(data);
    } catch (error) {
        console.error('Search error details:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/buy', async (req, res) => {
    console.log('POST /buy - Incoming request', req.body);
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) return res.status(400).json({ message: "Phone number required" });
        
        const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');
        const body = new URLSearchParams();
        body.append('PhoneNumber', phoneNumber);

        console.log(`Contacting Twilio to purchase: ${phoneNumber}`);
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/IncomingPhoneNumbers.json`, {
            method: 'POST',
            headers: { 
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        });

        const data = await response.json();
        console.log('Twilio purchase response status:', response.status);

        if (!response.ok) {
            console.error('Twilio purchase failed:', data);
            throw new Error(data.message || 'Twilio purchase failed');
        }

        console.log(`Success: Purchased ${data.phone_number}`);
        res.json(data);
    } catch (error) {
        console.error('Buy error details:', error);
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 Twilio Proxy Server running at http://localhost:${port}`);
    console.log(`Using SID: ${TWILIO_SID ? TWILIO_SID.substring(0, 5) + '...' : 'MISSING'}`);
});

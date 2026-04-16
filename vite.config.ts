import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            name: 'api-proxy-handshake',
            configureServer(server) {
                server.middlewares.use(async (req, res, next) => {
                    
                    // SMART INVENTORY (TWILIO + VAPI MERGED)
                    if (req.url?.startsWith('/api/twilio/inventory')) {
                        try {
                            const sid = process.env.VITE_TWILIO_ACCOUNT_SID;
                            const token = process.env.VITE_TWILIO_AUTH_TOKEN;
                            const vapiApiKey = process.env.VITE_VAPI_API_KEY;

                            if (!sid || !token) {
                                res.statusCode = 400;
                                res.end(JSON.stringify({ message: "Twilio credentials missing" }));
                                return;
                            }

                            const auth = Buffer.from(`${sid}:${token}`).toString('base64');
                            
                            // Load both simultaneously for speed
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

                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({
                                twilio: twilioData.incoming_phone_numbers || [],
                                vapi: vapiData
                            }));
                        } catch (e: any) {
                            res.statusCode = 500;
                            res.end(JSON.stringify({ message: e.message }));
                        }
                        return;
                    }

                    // TWILIO: Search for NEW numbers
                    if (req.url?.startsWith('/api/twilio/search')) {
                        try {
                            const url = new URL(req.url, `http://${req.headers.host}`);
                            const areaCode = url.searchParams.get('areaCode') || '';
                            const isoCode = url.searchParams.get('isoCode') || 'GB';
                            const sid = process.env.VITE_TWILIO_ACCOUNT_SID;
                            const token = process.env.VITE_TWILIO_AUTH_TOKEN;
                            const auth = Buffer.from(`${sid}:${token}`).toString('base64');
                            const twilioUrl = new URL(`https://api.twilio.com/2010-04-01/Accounts/${sid}/AvailablePhoneNumbers/${isoCode}/Local.json`);
                            if (areaCode && areaCode.length <= 4) twilioUrl.searchParams.append('AreaCode', areaCode);
                            else if (areaCode) twilioUrl.searchParams.append('Contains', areaCode);
                            const response = await fetch(twilioUrl.toString(), { headers: { 'Authorization': `Basic ${auth}` } });
                            const data = await response.json();
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(data));
                        } catch (e: any) {
                            res.statusCode = 500;
                            res.end(JSON.stringify({ message: e.message }));
                        }
                        return;
                    }

                    // VAPI: Connect/Update
                    if (req.url?.startsWith('/api/vapi/connect')) {
                        let body = '';
                        req.on('data', chunk => body += chunk);
                        req.on('end', async () => {
                            try {
                                const { phoneNumber, assistantId, name } = JSON.parse(body);
                                const vapiApiKey = process.env.VITE_VAPI_API_KEY;
                                const sid = process.env.VITE_TWILIO_ACCOUNT_SID;
                                const token = process.env.VITE_TWILIO_AUTH_TOKEN;
                                const headers = { 'Authorization': `Bearer ${vapiApiKey}`, 'Content-Type': 'application/json' };
                                const listRes = await fetch('https://api.vapi.ai/phone-number', { headers });
                                const list = await listRes.json();
                                const existing = Array.isArray(list) ? list.find((n: any) => n.number === phoneNumber) : null;
                                let final;
                                if (existing) {
                                    const resPatch = await fetch(`https://api.vapi.ai/phone-number/${existing.id}`, {
                                        method: 'PATCH', headers,
                                        body: JSON.stringify({ assistantId, name: name || `Agent: ${phoneNumber}` })
                                    });
                                    final = await resPatch.json();
                                    final._reconnected = true;
                                } else {
                                    const resImp = await fetch('https://api.vapi.ai/phone-number/import/twilio', {
                                        method: 'POST', headers,
                                        body: JSON.stringify({ twilioPhoneNumber: phoneNumber, twilioAccountSid: sid, twilioAuthToken: token, name: name || `Agent: ${phoneNumber}`, assistantId })
                                    });
                                    final = await resImp.json();
                                }
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(final));
                            } catch (e: any) {
                                res.statusCode = 500;
                                res.end(JSON.stringify({ message: e.message }));
                            }
                        });
                        return;
                    }

                    // TWILIO: BUY
                    if (req.url?.startsWith('/api/twilio/buy')) {
                        let body = '';
                        req.on('data', chunk => body += chunk);
                        req.on('end', async () => {
                            try {
                                const { phoneNumber } = JSON.parse(body);
                                const sid = process.env.VITE_TWILIO_ACCOUNT_SID;
                                const token = process.env.VITE_TWILIO_AUTH_TOKEN;
                                const auth = Buffer.from(`${sid}:${token}`).toString('base64');
                                const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/IncomingPhoneNumbers.json`, {
                                    method: 'POST', headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                                    body: new URLSearchParams({ PhoneNumber: phoneNumber }).toString()
                                });
                                const data = await response.json();
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(data));
                            } catch (e: any) {
                                res.statusCode = 500;
                                res.end(JSON.stringify({ message: e.message }));
                            }
                        });
                        return;
                    }
                    next();
                });
            }
        }
    ],
    envPrefix: ['VITE_', 'SUPABASE_'],
    server: { port: 5173, strictPort: false }
});

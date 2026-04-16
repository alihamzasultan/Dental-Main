import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, areaCode, phoneNumber } = await req.json()
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured in environment variables.')
    }

    const authHeader = `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`

    // --- Action: Search ---
    if (action === 'search') {
      const url = new URL(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/AvailablePhoneNumbers/GB/Local.json`)
      if (areaCode) url.searchParams.append('AreaCode', areaCode)
      
      const response = await fetch(url.toString(), {
        headers: { 'Authorization': authHeader }
      })

      const data = await response.json()
      const numbers = data.available_phone_numbers?.map((n: any) => ({
        id: n.phone_number,
        number: n.phone_number,
        type: 'Local',
        price: '£0.80/mo', // pricing varies, this is an estimate
        features: ['SMS', 'Voice']
      })) || []

      return new Response(JSON.stringify({ numbers }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // --- Action: Buy ---
    if (action === 'buy') {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json`
      const body = new URLSearchParams()
      body.append('PhoneNumber', phoneNumber)

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      })

      const data = await response.json()
      if (data.status === 400 || data.code) {
        throw new Error(data.message || 'Failed to purchase number')
      }

      return new Response(JSON.stringify({ success: true, number: data.phone_number }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

const https = require('https');

const supabaseUrl = 'lskzamecqaeatgemjyvp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxza3phbWVjcWFlYXRnZW1qeXZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMxMDEyMCwiZXhwIjoyMDg4ODg2MTIwfQ.xnPn32h78_lNGC6v8tbbYsVQUUvrQWU8gP3V2Q9JJYo';

const options = {
  hostname: supabaseUrl,
  path: `/rest/v1/?apikey=${supabaseKey}`,
  method: 'GET',
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.definitions && json.definitions.knowledge_base) {
        console.log("knowledge_base table properties:");
        console.log(JSON.stringify(json.definitions.knowledge_base.properties, null, 2));
      } else {
        console.log("knowledge_base not found in schema definitions.");
      }
    } catch (e) {
      console.error(e);
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();

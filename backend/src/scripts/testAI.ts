import { config } from '../config/env';
import OpenAI from 'openai';

async function testConnection() {
  console.log('\n========================================');
  console.log('     AI CONNECTION DIAGNOSTIC TOOL      ');
  console.log('========================================');
  console.log('Base URL: ', config.aiBaseUrl);
  console.log('Model:    ', config.aiModel);
  console.log('API Key:  ', config.aiApiKey ? `${config.aiApiKey.substring(0, 8)}... (${config.aiApiKey.length} chars)` : '(Empty / Not Set)');
  console.log('----------------------------------------');

  if (!config.aiApiKey) {
    console.log('\nStatus: NO API KEY PROVIDED');
    console.log('The backend is currently running with the zero-cost offline fallback engine.');
    console.log('To connect live AI, add your API key to backend/.env');
    return;
  }

  const client = new OpenAI({
    apiKey: config.aiApiKey,
    baseURL: config.aiBaseUrl,
  });

  try {
    const start = Date.now();
    const res = await client.chat.completions.create({
      model: config.aiModel,
      messages: [{ role: 'user', content: 'Reply with exactly: "AI connection verified!"' }],
    });
    const elapsed = Date.now() - start;
    console.log(`\nStatus: SUCCESS (${elapsed}ms)`);
    console.log('Model Output:', res.choices[0]?.message?.content);
    console.log('Your AI integration is working perfectly!');
  } catch (err: any) {
    console.log(`\nStatus: FAILED (HTTP ${err.status || 'unknown'})`);
    console.log('Provider Error:', err.message);

    if (config.aiApiKey.startsWith('AQ.')) {
      console.log('\n[DIAGNOSIS]: Your API key starts with "AQ.".');
      console.log('Official Google AI Studio API keys ALWAYS start with "AIzaSy...".');
      console.log('Please generate an API key from: https://aistudio.google.com/app/apikey');
    } else if (err.status === 401) {
      console.log('\n[DIAGNOSIS]: Invalid API key. Please verify the key in backend/.env');
    } else if (err.status === 404) {
      console.log(`\n[DIAGNOSIS]: Model "${config.aiModel}" not found at endpoint "${config.aiBaseUrl}".`);
    }
  }
}

testConnection();

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing ENV', { url, key });
  // Providing a professional fallback UI if env variables are missing
  if (typeof document !== 'undefined') {
    document.body.innerHTML = `
      <div style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        height: 100vh; 
        background-color: #080B16; 
        color: #ef4444; 
        font-family: sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Configuration Error</h1>
        <p style="font-size: 16px; color: #8A8A9A; max-width: 400px; line-height: 1.5;">
          Environment variables missing. Please check deployment settings in Vercel or your local .env file.
        </p>
      </div>
    `;
  }
  throw new Error('Supabase config missing');
}

export const supabase = createClient(url, key);

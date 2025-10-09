// src/utils/env.js
// Run early in app startup to validate important env vars (Vite: import.meta.env)

function isValidUrl(s) {
  try { new URL(s); return true; } catch (e) { return false; }
}

const checks = [
  { key: 'VITE_SUPABASE_URL', required: true, isUrl: true },
  { key: 'VITE_SUPABASE_ANON_KEY', required: true },
  // README mentions MONGODB_URI — keep as recommended (optional for frontend)
  { key: 'MONGODB_URI', required: false }
];

const missing = [];
const invalid = [];

checks.forEach(({ key, required, isUrl }) => {
  const val = import.meta.env[key];
  if ((!val || String(val).trim() === '') && required) {
    missing.push(key);
  } else if (val && isUrl && !isValidUrl(val)) {
    invalid.push(key);
  }
});

if (missing.length || invalid.length) {
  const parts = [];
  if (missing.length) parts.push(`Missing required environment variables: ${missing.join(', ')}`);
  if (invalid.length) parts.push(`Invalid URL environment variables: ${invalid.join(', ')}`);
  const message = `MongoBuddy — environment problem:\n\n${parts.join('\n')}\n\nPlease create .env from .env.example and fill values, then restart the dev server.`;

  // Console error
  // eslint-disable-next-line no-console
  console.error(message);

  // Show big red banner in the page so maintainers / users notice immediately
  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.setAttribute('id', 'env-error-overlay');
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.right = '0';
    el.style.background = 'rgba(180,30,30,0.98)';
    el.style.color = 'white';
    el.style.zIndex = '999999';
    el.style.padding = '18px';
    el.style.fontFamily = 'system-ui, sans-serif';
    el.style.whiteSpace = 'pre-wrap';
    el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
    el.innerText = message;
    document.body.appendChild(el);
    // push page content down a bit (so overlay doesn't hide devtools entirely)
    document.body.style.paddingTop = '110px';
  }

  // Stop further execution (throw will prevent app mounting)
  throw new Error(message);
}

// If everything's fine we export a tiny object (not strictly necessary)
export default {
  ok: true,
  env: {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    MONGODB_URI: import.meta.env.MONGODB_URI || null
  }
};

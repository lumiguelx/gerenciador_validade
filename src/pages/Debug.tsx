export default function Debug() {
  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Page</h1>
      <h2>Environment Variables:</h2>
      <pre>{JSON.stringify(env, null, 2)}</pre>
      
      <h2>Window Location:</h2>
      <pre>{JSON.stringify({
        href: window.location.href,
        origin: window.location.origin,
        pathname: window.location.pathname
      }, null, 2)}</pre>
      
      <h2>User Agent:</h2>
      <pre>{navigator.userAgent}</pre>
      
      <h2>Console Errors:</h2>
      <p>Check browser console (F12) for any JavaScript errors</p>
    </div>
  );
}
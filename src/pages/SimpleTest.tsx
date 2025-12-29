export default function SimpleTest() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      color: 'black',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🎉 Site está funcionando!</h1>
      <p>Se você está vendo esta página, o React está carregando corretamente.</p>
      
      <h2>Próximos passos:</h2>
      <ul>
        <li>✅ React funcionando</li>
        <li>✅ Roteamento funcionando</li>
        <li>⏳ Verificar variáveis de ambiente</li>
        <li>⏳ Verificar conexão Supabase</li>
      </ul>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <strong>URL atual:</strong> {window.location.href}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
          Ir para Dashboard
        </a>
        {' | '}
        <a href="/debug" style={{ color: 'blue', textDecoration: 'underline' }}>
          Página de Debug
        </a>
      </div>
    </div>
  );
}
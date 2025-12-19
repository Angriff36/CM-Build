export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#eff6ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '1rem',
          }}
        >
          🍳 PrepChef
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#4b5563' }}>Mobile Kitchen Operations</p>
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p style={{ color: '#374151' }}>Tailwind CSS is working!</p>
        </div>
      </div>
    </div>
  );
}

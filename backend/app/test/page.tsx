export default function TestPage() {
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '48px', color: '#4361ee' }}>✅ Server is Working!</h1>
            <p style={{ fontSize: '24px', marginTop: '20px' }}>
                If you can see this page, your Next.js server is running correctly.
            </p>
            <div style={{ marginTop: '40px' }}>
                <a 
                    href="/auth/boxed-signin" 
                    style={{ 
                        padding: '15px 30px', 
                        backgroundColor: '#4361ee', 
                        color: 'white', 
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '18px'
                    }}
                >
                    Go to Login Page
                </a>
            </div>
            <div style={{ marginTop: '40px', fontSize: '16px', color: '#666' }}>
                <p>Server: http://localhost:3001</p>
                <p>Login: http://localhost:3001/auth/boxed-signin</p>
                <p>Test Page: http://localhost:3001/test</p>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>F</div>
          <h1 style={styles.logoText}>FinanceOS</h1>
        </div>
        <p style={styles.subtitle}>Sign in to your dashboard</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="admin@finance.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            style={{...styles.btn, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.hint}>
          <div style={styles.hintTitle}>Demo Credentials</div>
          <div style={styles.hintRow}>
            <span style={styles.hintRole}>Admin</span>
            <span style={styles.hintCred}>admin@finance.com / Admin1234</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f1117'},
  card:{background:'#1e2130',border:'1px solid #2a2d3e',borderRadius:'16px',padding:'48px 40px',width:'100%',maxWidth:'420px',boxShadow:'0 4px 24px rgba(0,0,0,0.4)'},
  logo:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'},
  logoIcon:{width:'40px',height:'40px',borderRadius:'10px',background:'#6c63ff',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'800',fontSize:'20px'},
  logoText:{fontSize:'24px',fontWeight:'700',color:'#f1f5f9'},
  subtitle:{color:'#94a3b8',marginBottom:'32px',fontSize:'14px'},
  error:{background:'rgba(239,68,68,0.15)',color:'#ef4444',padding:'12px 16px',borderRadius:'8px',marginBottom:'20px',fontSize:'14px'},
  form:{display:'flex',flexDirection:'column',gap:'20px'},
  field:{display:'flex',flexDirection:'column',gap:'8px'},
  label:{fontSize:'13px',fontWeight:'500',color:'#94a3b8'},
  input:{background:'#1a1d27',border:'1px solid #2a2d3e',borderRadius:'8px',padding:'12px 16px',color:'#f1f5f9',fontSize:'14px',outline:'none',width:'100%'},
  btn:{background:'#6c63ff',color:'#fff',border:'none',borderRadius:'8px',padding:'13px',fontSize:'15px',fontWeight:'600',cursor:'pointer',marginTop:'8px',width:'100%'},
  hint:{marginTop:'28px',background:'#1a1d27',borderRadius:'8px',padding:'14px 16px',border:'1px solid #2a2d3e'},
  hintTitle:{fontSize:'11px',fontWeight:'600',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'8px'},
  hintRow:{display:'flex',alignItems:'center',gap:'10px'},
  hintRole:{background:'rgba(108,99,255,0.2)',color:'#6c63ff',padding:'2px 8px',borderRadius:'4px',fontSize:'12px',fontWeight:'600'},
  hintCred:{fontSize:'13px',color:'#94a3b8'},
};

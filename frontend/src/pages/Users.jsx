import { useEffect, useState } from 'react';
import { usersAPI } from '../api/api';

const ROLES = ['viewer','analyst','admin'];
const RC = {
  admin:   { bg:'rgba(239,68,68,0.15)',  color:'#ef4444' },
  analyst: { bg:'rgba(245,158,11,0.15)', color:'#f59e0b' },
  viewer:  { bg:'rgba(108,99,255,0.15)', color:'#6c63ff' },
};

export default function Users() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ full_name:'', email:'', password:'', role:'viewer' });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await usersAPI.getAll(); setUsers(r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await usersAPI.create(form);
      setShowForm(false);
      setForm({ full_name:'', email:'', password:'', role:'viewer' });
      load();
    } catch(err) {
      setError(err.response?.data?.detail || 'Failed to create user');
    } finally { setSaving(false); }
  };

  const handleActivate = async (id) => {
    try { await usersAPI.activate(id); load(); }
    catch { alert('Failed to activate'); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try { await usersAPI.deactivate(id); load(); }
    catch { alert('Failed to deactivate'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm('Are you sure you want to permanently delete ' + name + '? This action cannot be undone.')) return;
    try { await usersAPI.remove(id); load(); }
    catch { alert('Failed to delete user'); }
  };

  const activeCount = users.filter(u => u.is_active).length;

  return (
    <div>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>User Management</h2>
          <p style={s.sub}>{activeCount} active / {users.length} total users</p>
        </div>
        <button style={s.btnP} onClick={() => { setShowForm(!showForm); setError(''); }}>
          + Add User
        </button>
      </div>

      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>Create New User</h3>
          {error && <div style={s.errBox}>{error}</div>}
          <form onSubmit={handleCreate}>
            <div style={s.g2}>
              <div style={s.field}>
                <label style={s.lbl}>Full Name</label>
                <input style={s.inp} placeholder="Jane Doe"
                  value={form.full_name}
                  onChange={e => setForm(f=>({...f,full_name:e.target.value}))} required />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Email</label>
                <input style={s.inp} type="email" placeholder="jane@finance.com"
                  value={form.email}
                  onChange={e => setForm(f=>({...f,email:e.target.value}))} required />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Password</label>
                <input style={s.inp} type="password" placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm(f=>({...f,password:e.target.value}))} required />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Role</label>
                <select style={s.inp} value={form.role}
                  onChange={e => setForm(f=>({...f,role:e.target.value}))}>
                  {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:'12px',marginTop:'16px'}}>
              <button type="submit" style={s.btnP} disabled={saving}>
                {saving?'Creating...':'Create User'}
              </button>
              <button type="button" style={s.btnG}
                onClick={()=>{setShowForm(false);setError('');}}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{color:'#94a3b8',padding:'40px',textAlign:'center'}}>Loading users...</p>
      ) : (
        <div style={s.grid}>
          {users.map(u => {
            const rc = RC[u.role] || RC.viewer;
            return (
              <div key={u.id} style={{...s.card, opacity:u.is_active?1:0.65, borderLeft:'3px solid '+rc.color}}>
                <div style={s.cardHead}>
                  <div style={{...s.avatar,background:rc.color}}>
                    {u.full_name[0]?.toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={s.name}>{u.full_name}</div>
                    <div style={s.email}>{u.email}</div>
                  </div>
                  <span style={{
                    padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600',
                    background:u.is_active?'rgba(34,197,94,0.15)':'rgba(100,116,139,0.2)',
                    color:u.is_active?'#22c55e':'#64748b',
                  }}>
                    {u.is_active?'Active':'Inactive'}
                  </span>
                </div>
                <div style={s.cardFoot}>
                  <span style={{...s.role,background:rc.bg,color:rc.color}}>{u.role}</span>
                  <div style={{display:'flex',gap:'8px'}}>
                    {u.is_active ? (
                      <button style={s.btnDeact} onClick={()=>handleDeactivate(u.id)}>
                        Deactivate
                      </button>
                    ) : (
                      <button style={s.btnAct} onClick={()=>handleActivate(u.id)}>
                        Activate
                      </button>
                    )}
                    <button style={s.btnDel} onClick={()=>handleDelete(u.id, u.full_name)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  header:   {display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'24px'},
  title:    {fontSize:'24px',fontWeight:'700',marginBottom:'4px',color:'#f1f5f9'},
  sub:      {color:'#94a3b8',fontSize:'14px'},
  btnP:     {background:'#6c63ff',color:'#fff',border:'none',borderRadius:'8px',padding:'10px 20px',fontSize:'14px',fontWeight:'600',cursor:'pointer'},
  btnG:     {background:'transparent',color:'#94a3b8',border:'1px solid #2a2d3e',borderRadius:'8px',padding:'10px 20px',fontSize:'14px',cursor:'pointer'},
  formCard: {background:'#1e2130',border:'1px solid #2a2d3e',borderRadius:'12px',padding:'24px',marginBottom:'24px'},
  formTitle:{fontSize:'16px',fontWeight:'600',marginBottom:'20px',color:'#f1f5f9'},
  errBox:   {background:'rgba(239,68,68,0.15)',color:'#ef4444',padding:'10px 14px',borderRadius:'8px',marginBottom:'16px',fontSize:'13px'},
  g2:       {display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'},
  field:    {display:'flex',flexDirection:'column',gap:'6px'},
  lbl:      {fontSize:'12px',fontWeight:'500',color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px'},
  inp:      {background:'#0f1117',border:'1px solid #2a2d3e',borderRadius:'8px',padding:'10px 14px',color:'#f1f5f9',fontSize:'14px',outline:'none'},
  grid:     {display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'},
  card:     {background:'#1e2130',border:'1px solid #2a2d3e',borderRadius:'12px',padding:'20px'},
  cardHead: {display:'flex',gap:'12px',alignItems:'center',marginBottom:'16px'},
  avatar:   {width:'42px',height:'42px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:'700',flexShrink:0,color:'#fff'},
  name:     {fontWeight:'600',fontSize:'15px',marginBottom:'2px',color:'#f1f5f9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  email:    {fontSize:'13px',color:'#94a3b8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  cardFoot: {display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'14px',borderTop:'1px solid #2a2d3e'},
  role:     {padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',textTransform:'capitalize'},
  btnDeact: {background:'rgba(239,68,68,0.15)',color:'#ef4444',border:'none',borderRadius:'6px',padding:'6px 12px',fontSize:'12px',cursor:'pointer',fontWeight:'500'},
  btnAct:   {background:'rgba(34,197,94,0.15)',color:'#22c55e',border:'none',borderRadius:'6px',padding:'6px 12px',fontSize:'12px',cursor:'pointer',fontWeight:'500'},
  btnDel:   {background:'rgba(239,68,68,0.3)',color:'#ef4444',border:'1px solid #ef4444',borderRadius:'6px',padding:'6px 12px',fontSize:'12px',cursor:'pointer',fontWeight:'600'},
};

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  const allNavItems = [
    { to: '/dashboard', label: 'Dashboard', letter: 'D', roles: ['admin','analyst','viewer'] },
    { to: '/records',   label: 'Records',   letter: 'R', roles: ['admin','analyst'] },
    { to: '/users',     label: 'Users',     letter: 'U', roles: ['admin'] },
  ];

  const navItems = allNavItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>F</div>
          <span style={styles.brandName}>FinanceOS</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navActive : {}),
              })}
            >
              <span style={styles.navIcon}>{item.letter}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={styles.userBox}>
          <div style={styles.avatar}>{user?.email?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.userEmail}>{user?.email}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
            Out
          </button>
        </div>
      </aside>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  shell:{display:'flex',minHeight:'100vh'},
  sidebar:{width:'240px',background:'#1a1d27',borderRight:'1px solid #2a2d3e',display:'flex',flexDirection:'column',padding:'24px 16px',position:'fixed',top:0,left:0,height:'100vh'},
  brand:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'40px',paddingLeft:'4px'},
  brandIcon:{width:'36px',height:'36px',borderRadius:'10px',background:'#6c63ff',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'800',fontSize:'18px'},
  brandName:{fontSize:'18px',fontWeight:'700',color:'#f1f5f9'},
  nav:{display:'flex',flexDirection:'column',gap:'4px',flex:1},
  navItem:{display:'flex',alignItems:'center',gap:'12px',padding:'11px 14px',borderRadius:'8px',color:'#94a3b8',textDecoration:'none',fontSize:'14px',fontWeight:'500',transition:'all 0.15s'},
  navActive:{background:'rgba(108,99,255,0.15)',color:'#6c63ff'},
  navIcon:{width:'24px',height:'24px',borderRadius:'6px',background:'rgba(108,99,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'700',color:'#6c63ff',flexShrink:0},
  userBox:{display:'flex',alignItems:'center',gap:'10px',padding:'12px',background:'#0f1117',borderRadius:'8px',border:'1px solid #2a2d3e'},
  avatar:{width:'32px',height:'32px',borderRadius:'50%',background:'#6c63ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',flexShrink:0,color:'#fff'},
  userEmail:{fontSize:'12px',color:'#f1f5f9',fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  userRole:{fontSize:'11px',color:'#6c63ff',textTransform:'capitalize',marginTop:'2px'},
  logoutBtn:{background:'#2a2d3e',border:'none',color:'#94a3b8',cursor:'pointer',fontSize:'11px',borderRadius:'4px',padding:'4px 8px',flexShrink:0},
  main:{marginLeft:'240px',flex:1,padding:'32px',minHeight:'100vh'},
};

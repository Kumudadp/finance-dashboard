import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { dashboardAPI } from '../api/api';

const COLORS = ['#6c63ff','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6','#f97316','#8b5cf6','#06b6d4'];

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{...styles.card, borderTop:'3px solid '+color}}>
      <div style={styles.cardTop}>
        <span style={{fontSize:'20px'}}>{icon}</span>
        <span style={{...styles.cardLabel, color}}>{label}</span>
      </div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{background:'#1e2130',border:'1px solid #2a2d3e',borderRadius:'8px',padding:'10px 14px'}}>
        <p style={{color:'#f1f5f9',fontSize:'13px',fontWeight:'600'}}>{payload[0].name}</p>
        <p style={{color:'#6c63ff',fontSize:'13px'}}>Rs. {Number(payload[0].value).toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardAPI.getSummary()
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.center}>Loading dashboard...</div>;
  if (error) return <div style={{...styles.center, color:'#ef4444'}}>{error}</div>;

  const fmt = v => 'Rs. ' + Number(v).toLocaleString('en-IN', {minimumFractionDigits:2});
  const pieData = data.category_totals.map(c => ({
    name: c.category,
    value: Number(c.total),
  }));

  return (
    <div>
      <h2 style={styles.pageTitle}>Dashboard Overview</h2>
      <p style={styles.pageSub}>Your financial summary at a glance</p>

      <div style={styles.statGrid}>
        <StatCard label="Total Income" value={fmt(data.total_income)} color="#22c55e" icon="&#128200;" />
        <StatCard label="Total Expenses" value={fmt(data.total_expenses)} color="#ef4444" icon="&#128201;" />
        <StatCard label="Net Balance" value={fmt(data.net_balance)} color="#6c63ff" icon="&#128176;" />
        <StatCard label="Total Records" value={data.total_records} color="#f59e0b" icon="&#128203;" />
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Monthly Trends</h3>
          {data.monthly_trends.length === 0
            ? <p style={styles.empty}>Add records to see monthly trends</p>
            : <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.monthly_trends} margin={{top:10,right:10,left:0,bottom:0}}>
                  <XAxis dataKey="month" stroke="#64748b" tick={{fontSize:12,fill:'#94a3b8'}} />
                  <YAxis stroke="#64748b" tick={{fontSize:12,fill:'#94a3b8'}} />
                  <Tooltip contentStyle={{background:'#1e2130',border:'1px solid #2a2d3e',borderRadius:'8px'}} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4,4,0,0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Spending by Category</h3>
          {pieData.length === 0
            ? <p style={styles.empty}>Add records to see category breakdown</p>
            : <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={40}
                    paddingAngle={3}
                    label={({name, percent}) => name + ' ' + (percent*100).toFixed(0) + '%'}
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
          }
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageTitle:{fontSize:'24px',fontWeight:'700',marginBottom:'4px'},
  pageSub:{color:'#94a3b8',fontSize:'14px',marginBottom:'28px'},
  statGrid:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px'},
  card:{background:'#1e2130',border:'1px solid #2a2d3e',borderRadius:'12px',padding:'20px 24px'},
  cardTop:{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'},
  cardLabel:{fontSize:'13px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px'},
  cardValue:{fontSize:'26px',fontWeight:'700',color:'#f1f5f9'},
  chartsRow:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'},
  chartCard:{background:'#1e2130',border:'1px solid #2a2d3e',borderRadius:'12px',padding:'24px'},
  chartTitle:{fontSize:'15px',fontWeight:'600',marginBottom:'20px',color:'#f1f5f9'},
  center:{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',fontSize:'16px',color:'#94a3b8'},
  empty:{color:'#64748b',textAlign:'center',padding:'40px',fontSize:'14px'},
};

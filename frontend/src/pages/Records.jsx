import { useEffect, useState, useCallback } from 'react';
import './Records.css';
import { recordsAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['salary','investment','rent','utilities','food','transport','healthcare','entertainment','tax','other'];
const TYPES = ['income','expense'];
const EMPTY = { amount:'', type:'income', category:'salary', date:'', description:'' };

function Badge({ value, type }) {
  return <span className={'badge ' + (type==='income'?'badge-income':'badge-expense')}>{value}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="close-btn" onClick={onClose}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function RecordForm({ form, setForm, error, onSubmit, onCancel, label, saving }) {
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <form onSubmit={onSubmit}>
      {error && <div className="error-box">{error}</div>}
      <div className="form-grid">
        <div className="field">
          <label className="field-label">Amount (Rs.)</label>
          <input className="field-input" type="number" step="0.01" min="0.01"
            value={form.amount} onChange={e => set('amount', e.target.value)} required />
        </div>
        <div className="field">
          <label className="field-label">Type</label>
          <select className="field-input" value={form.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Category</label>
          <select className="field-input" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Date</label>
          <input className="field-input" type="date"
            value={form.date} onChange={e => set('date', e.target.value)} required />
        </div>
        <div className="field field-full">
          <label className="field-label">Description (optional)</label>
          <input className="field-input" type="text" placeholder="e.g. Monthly salary"
            value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : label}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function Records() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [records,     setRecords]     = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [showCreate,  setShowCreate]  = useState(false);
  const [cForm,       setCForm]       = useState({ ...EMPTY });
  const [cError,      setCError]      = useState('');
  const [editRec,     setEditRec]     = useState(null);
  const [eForm,       setEForm]       = useState({ ...EMPTY });
  const [eError,      setEError]      = useState('');
  const [saving,      setSaving]      = useState(false);
  const [filters,     setFilters]     = useState({ type:'', category:'', date_from:'', date_to:'', search:'' });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const p = { page, page_size: 10 };
      if (filters.type)      p.type      = filters.type;
      if (filters.category)  p.category  = filters.category;
      if (filters.date_from) p.date_from = filters.date_from;
      if (filters.date_to)   p.date_to   = filters.date_to;
      if (filters.search)    p.search    = filters.search;
      const res = await recordsAPI.getAll(p);
      setRecords(res.data.data);
      setTotal(res.data.total);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setCError('');
    try {
      await recordsAPI.create({
        amount:      parseFloat(cForm.amount),
        type:        cForm.type,
        category:    cForm.category,
        date:        cForm.date,
        description: cForm.description || null,
      });
      setShowCreate(false);
      setCForm({ ...EMPTY });
      fetchRecords();
    } catch(err) {
      const d = err.response?.data?.detail;
      setCError(Array.isArray(d) ? d.map(x=>x.msg).join(', ') : d || 'Failed to create');
    } finally { setSaving(false); }
  };

  const openEdit = (r) => {
    setEForm({
      amount:      String(parseFloat(r.amount)),
      type:        r.type,
      category:    r.category,
      date:        r.date,
      description: r.description || '',
    });
    setEError('');
    setEditRec(r);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true); setEError('');
    try {
      const payload = {
        amount:   parseFloat(eForm.amount),
        type:     eForm.type,
        category: eForm.category,
        date:     eForm.date,
      };
      if (eForm.description && eForm.description.trim() !== '') {
        payload.description = eForm.description.trim();
      } else {
        payload.description = null;
      }
      const res = await recordsAPI.update(editRec.id, payload);
      console.log('Updated:', res.data);
      setEditRec(null);
      setEForm({ ...EMPTY });
      await fetchRecords();
    } catch(err) {
      console.error('Update failed:', err.response?.data);
      const d = err.response?.data?.detail;
      setEError(Array.isArray(d) ? d.map(x=>x.msg).join(', ') : d || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    try {
      await recordsAPI.remove(id);
      fetchRecords();
    } catch { alert('Failed to delete'); }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Financial Records</h2>
          <p className="page-sub">{total} total records</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setCForm({...EMPTY}); setCError(''); setShowCreate(true); }}>
            + Add Record
          </button>
        )}
      </div>

      {showCreate && (
        <Modal title="New Financial Record" onClose={() => { setShowCreate(false); setCForm({...EMPTY}); }}>
          <RecordForm form={cForm} setForm={setCForm} error={cError}
            onSubmit={handleCreate} onCancel={() => { setShowCreate(false); setCForm({...EMPTY}); }}
            label="Save Record" saving={saving} />
        </Modal>
      )}

      {editRec !== null && (
        <Modal title="Edit Record" onClose={() => { setEditRec(null); setEForm({...EMPTY}); }}>
          <RecordForm form={eForm} setForm={setEForm} error={eError}
            onSubmit={handleUpdate} onCancel={() => { setEditRec(null); setEForm({...EMPTY}); }}
            label="Update Record" saving={saving} />
        </Modal>
      )}

      <div className="filter-bar">
        <input className="filter-input" placeholder="Search description..."
          value={filters.search} onChange={e => setFilters(f=>({...f,search:e.target.value}))} />
        <select className="filter-input" value={filters.type}
          onChange={e => setFilters(f=>({...f,type:e.target.value}))}>
          <option value="">All Types</option>
          {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <select className="filter-input" value={filters.category}
          onChange={e => setFilters(f=>({...f,category:e.target.value}))}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <input className="filter-input" type="date" value={filters.date_from}
          onChange={e => setFilters(f=>({...f,date_from:e.target.value}))} />
        <input className="filter-input" type="date" value={filters.date_to}
          onChange={e => setFilters(f=>({...f,date_to:e.target.value}))} />
        <button className="btn-ghost"
          onClick={() => setFilters({type:'',category:'',date_from:'',date_to:'',search:''})}>
          Reset
        </button>
      </div>

      <div className="table-card">
        {loading ? <div className="center-msg">Loading...</div>
        : records.length === 0 ? <div className="empty-msg">No records found.</div>
        : <table className="records-table">
            <thead>
              <tr>
                <th>Date</th><th>Type</th><th>Category</th>
                <th>Amount</th><th>Description</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td><Badge value={r.type} type={r.type} /></td>
                  <td><span className="cat-badge">{r.category}</span></td>
                  <td className={r.type==='income'?'amount-income':'amount-expense'}>
                    {r.type==='income'?'+':'-'} Rs.{Number(r.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="desc-cell">{r.description||'-'}</td>
                  {isAdmin && (
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => openEdit(r)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(r.id)}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button className="page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next</button>
        </div>
      )}
    </div>
  );
}

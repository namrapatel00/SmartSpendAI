import { useEffect, useState } from 'react';
import { getBudgets, saveBudget, deleteBudget } from '../services/api';

const CATEGORIES = ['Food','Travel','Bills','Shopping','Entertainment','Other'];
const now = new Date();

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({
    category:'', monthlyLimit:'', month: now.getMonth()+1, year: now.getFullYear()
  });
  const [loading, setLoading] = useState(false);

  const load = () =>
    getBudgets(form.month, form.year).then(r => setBudgets(r.data)).catch(console.error);

  useEffect(() => { load(); }, [form.month, form.year]); // eslint-disable-line

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveBudget({ ...form, monthlyLimit: parseFloat(form.monthlyLimit), month: parseInt(form.month), year: parseInt(form.year) });
      setForm(f => ({ ...f, monthlyLimit:'' }));
      await load();
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const remove = async id => {
    await deleteBudget(id);
    setBudgets(budgets.filter(b => b.id !== id));
  };

  return (
    <div>
      <h1 className="page-title">📋 Budgets</h1>
      <div className="dash-grid">
        {/* ── Set Budget Form ── */}
        <div className="card">
          <h2>🎯 Set Monthly Budget</h2>
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handle} required>
                <option value="">Select</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Monthly Limit ($)</label>
              <input name="monthlyLimit" type="number" step="1" value={form.monthlyLimit} onChange={handle} required placeholder="500"/>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div className="form-group">
                <label>Month</label>
                <select name="month" value={form.month} onChange={handle}>
                  {[...Array(12)].map((_,i) => (
                    <option key={i+1} value={i+1}>{new Date(2024,i).toLocaleString('default',{month:'short'})}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <select name="year" value={form.year} onChange={handle}>
                  {[2024,2025,2026].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Saving...' : '💾 Save Budget'}
            </button>
          </form>
        </div>

        {/* ── Tip box ── */}
        <div className="card" style={{alignSelf:'start'}}>
          <h2>💡 Budgeting Tips</h2>
          {[
            ['🍕 Food', 'Keep under 15% of monthly income'],
            ['✈️ Travel', 'Set aside 5–10% for experiences'],
            ['⚡ Bills', 'Should be under 30% (rent + utilities)'],
            ['🛍️ Shopping', 'Cap at 10% to avoid impulse spending'],
            ['🎬 Entertainment', '5% is a good starting limit'],
          ].map(([cat, tip]) => (
            <div className="insight-chip" key={cat}>
              <span>{cat}</span>
              <span style={{color:'var(--muted)', fontSize:'0.8rem'}}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Budget Status Cards ── */}
      <div className="card">
        <h2>📊 Budget Tracker — {new Date(form.year, form.month-1).toLocaleString('default',{month:'long'})} {form.year}</h2>
        {budgets.length === 0
          ? <p className="empty-state">No budgets set for this month. Add one above!</p>
          : budgets.map(b => {
              const pct   = Math.min((b.amountSpent / b.monthlyLimit) * 100, 100);
              const color = b.isOverBudget ? 'var(--danger)' : pct > 80 ? 'var(--warn)' : 'var(--accent2)';
              return (
                <div key={b.id} style={{marginBottom:20, background:'var(--surface2)', borderRadius:10, padding:16, border:'1px solid var(--border)'}}>
                  <div className="flex justify-between items-center" style={{marginBottom:8}}>
                    <span style={{fontWeight:700, fontSize:'1rem'}}>{b.category}</span>
                    <div className="flex items-center gap-3">
                      {b.isOverBudget && <span className="badge badge-red">⚠️ Over Budget!</span>}
                      <span style={{fontWeight:600, color}}>
                        ${b.amountSpent.toFixed(0)} / ${b.monthlyLimit.toFixed(0)}
                      </span>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(b.id)}>✕</button>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width:`${pct}%`, background: color}}/>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', marginTop:6, fontSize:'0.78rem', color:'var(--muted)'}}>
                    <span>{pct.toFixed(0)}% used</span>
                    <span>
                      {b.isOverBudget
                        ? `$${Math.abs(b.remaining).toFixed(0)} over limit`
                        : `$${b.remaining.toFixed(0)} remaining`}
                    </span>
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}

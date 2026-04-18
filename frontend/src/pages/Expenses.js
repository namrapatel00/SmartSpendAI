import { useEffect, useState } from 'react';
import { getExpenses, addExpense, updateExpense, deleteExpense, getCards, getRecommendation } from '../services/api';

const CATEGORIES = ['Food','Travel','Bills','Shopping','Entertainment','Other'];
const categoryIcon = c => ({Food:'🍕',Travel:'✈️',Bills:'⚡',Shopping:'🛍️',Entertainment:'🎬',Other:'💼'}[c]||'💼');

const now = new Date();
const CASH_OPTION = 'cash';
const createEmptyForm = () => ({
  title:'', amount:'', category:'', creditCardId:'', date: now.toISOString().slice(0,10), notes:''
});
const toExpensePayload = form => ({
  ...form,
  amount: parseFloat(form.amount),
  creditCardId: form.creditCardId && form.creditCardId !== CASH_OPTION ? parseInt(form.creditCardId) : null,
  date: new Date(form.date).toISOString()
});

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [cards,    setCards]    = useState([]);
  const [rec,      setRec]      = useState(null);
  const [month,    setMonth]    = useState(now.getMonth() + 1);
  const [year,     setYear]     = useState(now.getFullYear());
  const [form, setForm] = useState(createEmptyForm);
  const [loading, setLoading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const loadExpenses = () =>
    getExpenses(month, year).then(r => setExpenses(r.data)).catch(console.error);

  useEffect(() => {
    loadExpenses();
    getCards().then(r => setCards(r.data)).catch(console.error);
  }, [month, year]); // eslint-disable-line

  // When category changes, suggest best card
  useEffect(() => {
    if (form.category)
      getRecommendation(form.category).then(r => setRec(r.data)).catch(() => setRec(null));
  }, [form.category]);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = toExpensePayload(form);

      if (editingExpenseId) {
        const { data } = await updateExpense(editingExpenseId, payload);
        setExpenses(expenses.map(e => e.id === editingExpenseId ? data : e));
        setSelectedExpense(data);
      } else {
        await addExpense(payload);
        await loadExpenses();
      }

      setForm(createEmptyForm());
      setEditingExpenseId(null);
      setRec(null);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const remove = async id => {
    await deleteExpense(id);
    setExpenses(expenses.filter(e => e.id !== id));
    if (selectedExpense?.id === id) setSelectedExpense(null);
    if (editingExpenseId === id) {
      setEditingExpenseId(null);
      setForm(createEmptyForm());
    }
  };

  const startEdit = expense => {
    setEditingExpenseId(expense.id);
    setSelectedExpense(expense);
    setForm({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      creditCardId: expense.creditCardId ? expense.creditCardId.toString() : '',
      date: new Date(expense.date).toISOString().slice(0,10),
      notes: expense.notes || ''
    });
  };

  const cancelEdit = () => {
    setEditingExpenseId(null);
    setForm(createEmptyForm());
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const totalCashback = expenses.reduce((s, e) => s + e.cashbackEarned, 0);

  return (
    <div>
      <h1 className="page-title">💸 Expenses</h1>

      <div className="dash-grid">
        {/* ── Add Expense Form ── */}
        <div className="card">
          <h2>➕ Add Expense</h2>
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Title</label>
              <input name="title" value={form.title} onChange={handle} required placeholder="e.g. Chipotle"/>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div className="form-group">
                <label>Amount ($)</label>
                <input name="amount" type="number" step="0.01" value={form.amount} onChange={handle} required placeholder="0.00"/>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input name="date" type="date" value={form.date} onChange={handle} required/>
              </div>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handle} required>
                <option value="">Select</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Smart card suggestion */}
            {rec && rec.bestCardName && (
              <div style={{background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:8, padding:'10px 14px', marginBottom:12, fontSize:'0.82rem'}}>
                💡 <strong>Best card for {rec.category}:</strong> {rec.bestCardBank} {rec.bestCardName} — <span className="text-green">{rec.bestCashbackPercent}% cashback</span>
              </div>
            )}

            <div className="form-group">
              <label>Pay With (optional)</label>
              <select name="creditCardId" value={form.creditCardId} onChange={handle}>
                <option value="">— Select card —</option>
                {cards.map(c => <option key={c.id} value={c.id}>{c.cardName} ···{c.last4Digits}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handle} placeholder="Any note..." rows="3"/>
            </div>
            <div style={{display:'flex', gap:10}}>
              <button className="btn btn-primary btn-full" disabled={loading}>
                {loading ? (editingExpenseId ? 'Saving...' : 'Adding...') : (editingExpenseId ? 'Save Changes' : '+ Add Expense')}
              </button>
              {editingExpenseId && (
                <button type="button" className="btn btn-danger" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── Month picker + summary ── */}
        <div>
          <div className="card" style={{marginBottom:16}}>
            <h2>📅 Filter by Month</h2>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div className="form-group">
                <label>Month</label>
                <select value={month} onChange={e => setMonth(+e.target.value)}>
                  {[...Array(12)].map((_,i) => (
                    <option key={i+1} value={i+1}>{new Date(2024,i).toLocaleString('default',{month:'long'})}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <select value={year} onChange={e => setYear(+e.target.value)}>
                  {[2023,2024,2025,2026].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="stats-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
            <div className="stat-card">
              <div className="stat-label">Total Spent</div>
              <div className="stat-value blue">${total.toFixed(2)}</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Cashback Earned</div>
              <div className="stat-value green">${totalCashback.toFixed(2)}</div>
            </div>
          </div>

          {selectedExpense && (
            <div className="card">
              <h2>Expense Details</h2>
              <div style={{display:'grid', gap:10, fontSize:'0.9rem'}}>
                <div><strong>Title:</strong> {selectedExpense.title}</div>
                <div><strong>Date:</strong> {new Date(selectedExpense.date).toLocaleDateString()}</div>
                <div><strong>Category:</strong> {selectedExpense.category}</div>
                <div><strong>Amount:</strong> ${selectedExpense.amount.toFixed(2)}</div>
                <div><strong>Card:</strong> {selectedExpense.cardName || '-'}</div>
                <div><strong>Cashback:</strong> <span className="text-green">+${selectedExpense.cashbackEarned.toFixed(2)}</span></div>
                {selectedExpense.notes?.trim()
                  ? (
                    <div>
                      <strong>Notes:</strong>
                      <div style={{marginTop:6, padding:'12px 14px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, lineHeight:1.5}}>
                        {selectedExpense.notes}
                      </div>
                    </div>
                    )
                  : <div><strong>Notes:</strong> <span className="text-muted">None</span></div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Expenses Table ── */}
      <div className="card">
        <h2>📃 Transaction History ({expenses.length})</h2>
        {expenses.length === 0
          ? <p className="empty-state">No expenses this month. Add one above!</p>
          : <div style={{overflowX:'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Title</th><th>Category</th>
                    <th>Card</th><th>Amount</th><th>Cashback</th><th>Notes</th><th>View</th><th>Edit</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e.id}>
                      <td className="text-muted">{new Date(e.date).toLocaleDateString()}</td>
                      <td style={{fontWeight:500}}>{e.title}</td>
                      <td><span className="badge badge-blue">{categoryIcon(e.category)} {e.category}</span></td>
                      <td className="text-muted">{e.cardName || '—'}</td>
                      <td style={{fontWeight:700}}>${e.amount.toFixed(2)}</td>
                      <td className="text-green">+${e.cashbackEarned.toFixed(2)}</td>
                      <td>{e.notes?.trim() ? <span className="badge badge-green">Has notes</span> : <span className="text-muted">-</span>}</td>
                      <td>
                        <button type="button" className="btn btn-sm" style={{background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)'}} onClick={() => setSelectedExpense(e)}>View</button>
                      </td>
                      <td>
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => startEdit(e)}>Edit</button>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(e.id)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  );
}

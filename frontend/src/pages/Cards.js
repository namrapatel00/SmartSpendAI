import { useEffect, useState } from 'react';
import { getCards, addCard, deleteCard } from '../services/api';

const PRESETS = [
  { cardName:'Chase Freedom Flex', bank:'Chase', annualFee:0,
    foodCashback:3, travelCashback:5, billsCashback:1, shoppingCashback:5, entertainmentCashback:1, otherCashback:1 },
  { cardName:'Discover It Cash Back', bank:'Discover', annualFee:0,
    foodCashback:5, travelCashback:1, billsCashback:1, shoppingCashback:5, entertainmentCashback:1, otherCashback:1 },
  { cardName:'Capital One Quicksilver', bank:'Capital One', annualFee:0,
    foodCashback:1.5, travelCashback:1.5, billsCashback:1.5, shoppingCashback:1.5, entertainmentCashback:1.5, otherCashback:1.5 },
  { cardName:'Amex Blue Cash Preferred', bank:'Amex', annualFee:95,
    foodCashback:6, travelCashback:1, billsCashback:3, shoppingCashback:2, entertainmentCashback:1, otherCashback:1 },
  { cardName:'Citi Double Cash', bank:'Citi', annualFee:0,
    foodCashback:2, travelCashback:2, billsCashback:2, shoppingCashback:2, entertainmentCashback:2, otherCashback:2 },
];

const emptyForm = {
  cardName:'', bank:'', last4Digits:'', annualFee:0,
  foodCashback:1, travelCashback:1, billsCashback:1,
  shoppingCashback:1, entertainmentCashback:1, otherCashback:1
};

export default function Cards() {
  const [cards,   setCards]   = useState([]);
  const [form,    setForm]    = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getCards().then(r => setCards(r.data)).catch(console.error);
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const loadPreset = p => {
    setForm({ ...p, last4Digits: '', annualFee: p.annualFee });
    setShowForm(true);
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await addCard({
        ...form,
        annualFee: parseFloat(form.annualFee),
        foodCashback: parseFloat(form.foodCashback),
        travelCashback: parseFloat(form.travelCashback),
        billsCashback: parseFloat(form.billsCashback),
        shoppingCashback: parseFloat(form.shoppingCashback),
        entertainmentCashback: parseFloat(form.entertainmentCashback),
        otherCashback: parseFloat(form.otherCashback),
      });
      const r = await getCards();
      setCards(r.data);
      setForm(emptyForm);
      setShowForm(false);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const remove = async id => {
    await deleteCard(id);
    setCards(cards.filter(c => c.id !== id));
  };

  const cashbackFields = [
    ['foodCashback','🍕 Food'],['travelCashback','✈️ Travel'],['billsCashback','⚡ Bills'],
    ['shoppingCashback','🛍️ Shopping'],['entertainmentCashback','🎬 Entertainment'],['otherCashback','💼 Other']
  ];

  return (
    <div>
      <h1 className="page-title">🃏 Credit Cards</h1>

      {/* ── Quick-add presets ── */}
      <div className="card mb-6">
        <h2>⚡ Quick Add from Presets</h2>
        <p className="text-muted mb-4">Click any popular card to auto-fill cashback rates</p>
        <div style={{display:'flex', flexWrap:'wrap', gap:10}}>
          {PRESETS.map(p => (
            <button key={p.cardName} className="btn btn-primary btn-sm" onClick={() => loadPreset(p)}>
              + {p.cardName}
            </button>
          ))}
          <button className="btn btn-sm" style={{background:'var(--surface2)', border:'1px solid var(--border)'}}
            onClick={() => { setForm(emptyForm); setShowForm(true); }}>
            + Custom Card
          </button>
        </div>
      </div>

      <div className="dash-grid" style={{alignItems:'start'}}>
        {/* ── Add Card Form ── */}
        {showForm && (
          <div className="card">
            <h2>➕ Card Details</h2>
            <form onSubmit={submit}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div className="form-group">
                  <label>Card Name</label>
                  <input name="cardName" value={form.cardName} onChange={handle} required placeholder="Chase Freedom"/>
                </div>
                <div className="form-group">
                  <label>Bank</label>
                  <input name="bank" value={form.bank} onChange={handle} required placeholder="Chase"/>
                </div>
                <div className="form-group">
                  <label>Last 4 Digits</label>
                  <input name="last4Digits" value={form.last4Digits} onChange={handle} maxLength={4} placeholder="1234"/>
                </div>
                <div className="form-group">
                  <label>Annual Fee ($)</label>
                  <input name="annualFee" type="number" step="1" value={form.annualFee} onChange={handle}/>
                </div>
              </div>

              <p style={{fontSize:'0.8rem', color:'var(--muted)', marginBottom:10}}>Cashback % per category:</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
                {cashbackFields.map(([field, label]) => (
                  <div className="form-group" key={field}>
                    <label>{label}</label>
                    <input name={field} type="number" step="0.1" min="0" max="20"
                      value={form[field]} onChange={handle}/>
                  </div>
                ))}
              </div>

              <div style={{display:'flex', gap:10, marginTop:8}}>
                <button className="btn btn-primary" style={{flex:1}} disabled={loading}>
                  {loading ? 'Adding...' : '💾 Add Card'}
                </button>
                <button type="button" className="btn btn-danger" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ── Card list ── */}
        <div>
          {cards.length === 0
            ? <div className="card"><p className="empty-state">No cards added yet. Use presets above!</p></div>
            : cards.map(c => (
                <div className="card mb-6" key={c.id} style={{marginBottom:16}}>
                  <div className="flex justify-between items-center" style={{marginBottom:14}}>
                    <div>
                      <div style={{fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:'1.05rem'}}>{c.cardName}</div>
                      <div className="text-muted">{c.bank} · ···{c.last4Digits} · {c.annualFee===0?'No annual fee':`$${c.annualFee}/yr`}</div>
                    </div>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(c.id)}>Remove</button>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
                    {[['🍕','Food',c.foodCashback],['✈️','Travel',c.travelCashback],['⚡','Bills',c.billsCashback],
                      ['🛍️','Shop',c.shoppingCashback],['🎬','Entertain',c.entertainmentCashback],['💼','Other',c.otherCashback]
                    ].map(([icon, cat, val]) => (
                      <div key={cat} style={{background:'var(--bg)', borderRadius:8, padding:'8px 12px', textAlign:'center'}}>
                        <div style={{fontSize:'0.7rem', color:'var(--muted)'}}>{icon} {cat}</div>
                        <div style={{fontWeight:800, color:'var(--accent2)', fontSize:'1.1rem'}}>{val}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}

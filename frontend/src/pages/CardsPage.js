import { useEffect, useRef, useState } from 'react';
import { getCards, addCard, deleteCard, getMyProfile, searchCards } from '../services/api';

const CARD_CATALOG = [
  {
    cardName: 'Chase Freedom Flex',
    bank: 'Chase',
    annualFee: 0,
    minScore: 670,
    foodCashback: 3,
    travelCashback: 5,
    billsCashback: 1,
    shoppingCashback: 5,
    entertainmentCashback: 1,
    otherCashback: 1,
    rewardSummary: '5% rotating categories, 5% Chase Travel, 3% dining and drugstores, 1% other',
    officialUrl: 'https://creditcards.chase.com/cash-back-credit-cards/freedom/flex'
  },
  {
    cardName: 'Chase Freedom Unlimited',
    bank: 'Chase',
    annualFee: 0,
    minScore: 670,
    foodCashback: 3,
    travelCashback: 5,
    billsCashback: 1.5,
    shoppingCashback: 1.5,
    entertainmentCashback: 1.5,
    otherCashback: 1.5,
    rewardSummary: '5% Chase Travel, 3% dining and drugstores, 1.5% on all other purchases',
    officialUrl: 'https://creditcards.chase.com/cash-back-credit-cards/chase-freedom-unlimited'
  },
  {
    cardName: 'Discover it Cash Back',
    bank: 'Discover',
    annualFee: 0,
    minScore: 640,
    foodCashback: 5,
    travelCashback: 1,
    billsCashback: 1,
    shoppingCashback: 5,
    entertainmentCashback: 1,
    otherCashback: 1,
    rewardSummary: '5% rotating quarterly categories after activation, 1% on all other purchases',
    officialUrl: 'https://www.discover.com/credit-cards/cash-back/it-card.html'
  },
  {
    cardName: 'Capital One Quicksilver',
    bank: 'Capital One',
    annualFee: 0,
    minScore: 620,
    foodCashback: 1.5,
    travelCashback: 1.5,
    billsCashback: 1.5,
    shoppingCashback: 1.5,
    entertainmentCashback: 1.5,
    otherCashback: 1.5,
    rewardSummary: 'Unlimited 1.5% cash back on every purchase',
    officialUrl: 'https://www.capitalone.com/credit-cards/quicksilver/'
  },
  {
    cardName: 'Capital One Savor',
    bank: 'Capital One',
    annualFee: 0,
    minScore: 690,
    foodCashback: 3,
    travelCashback: 5,
    billsCashback: 1,
    shoppingCashback: 1,
    entertainmentCashback: 3,
    otherCashback: 1,
    rewardSummary: '3% on dining, grocery, entertainment and streaming, 5% Capital One Travel, 1% other',
    officialUrl: 'https://www.capitalone.com/credit-cards/savor/'
  },
  {
    cardName: 'Capital One Venture Rewards',
    bank: 'Capital One',
    annualFee: 95,
    minScore: 700,
    foodCashback: 2,
    travelCashback: 5,
    billsCashback: 2,
    shoppingCashback: 2,
    entertainmentCashback: 2,
    otherCashback: 2,
    rewardSummary: '2X miles on every purchase, 5X on hotels and rental cars through Capital One Travel',
    officialUrl: 'https://www.capitalone.com/credit-cards/venture/'
  },
  {
    cardName: 'Citi Double Cash',
    bank: 'Citi',
    annualFee: 0,
    minScore: 680,
    foodCashback: 2,
    travelCashback: 5,
    billsCashback: 2,
    shoppingCashback: 2,
    entertainmentCashback: 2,
    otherCashback: 2,
    rewardSummary: '2% cash back total on purchases, plus 5% on Citi Travel bookings',
    officialUrl: 'https://www.citi.com/credit-cards/citi-double-cash-credit-card'
  },
  {
    cardName: 'Amex Blue Cash Everyday',
    bank: 'American Express',
    annualFee: 0,
    minScore: 670,
    foodCashback: 3,
    travelCashback: 1,
    billsCashback: 1,
    shoppingCashback: 3,
    entertainmentCashback: 1,
    otherCashback: 1,
    rewardSummary: '3% at U.S. supermarkets, U.S. gas stations and U.S. online retail, 1% other',
    officialUrl: 'https://www.americanexpress.com/en-us/credit-cards/credit-intel/amex-blue-cash-everyday-benefits/'
  },
  {
    cardName: 'Amex Blue Cash Preferred',
    bank: 'American Express',
    annualFee: 95,
    minScore: 700,
    foodCashback: 6,
    travelCashback: 3,
    billsCashback: 3,
    shoppingCashback: 1,
    entertainmentCashback: 6,
    otherCashback: 1,
    rewardSummary: '6% groceries and select streaming, 3% gas and transit, $95 annual fee after intro year',
    officialUrl: 'https://www.americanexpress.com/en-us/benefits/cashback/'
  }
];

const emptyForm = {
  cardName:'', bank:'', last4Digits:'', annualFee:0,
  foodCashback:1, travelCashback:1, billsCashback:1,
  shoppingCashback:1, entertainmentCashback:1, otherCashback:1
};

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState(null);
  const [webResults, setWebResults] = useState([]);
  const [searchingWeb, setSearchingWeb] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    getCards().then(r => setCards(r.data)).catch(console.error);
    getMyProfile().then(r => setProfile(r.data)).catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    if (search.trim().length < 3) {
      setWebResults([]);
      setSearchingWeb(false);
      return;
    }

    const timeout = setTimeout(() => {
      setSearchingWeb(true);
      searchCards(search)
        .then(r => setWebResults(r.data))
        .catch(() => setWebResults([]))
        .finally(() => setSearchingWeb(false));
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const loadPreset = preset => {
    setForm({ ...preset, last4Digits: '', annualFee: preset.annualFee });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const openCustomCardForm = () => {
    setForm(emptyForm);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
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
    ['foodCashback','Food'],
    ['travelCashback','Travel'],
    ['billsCashback','Bills'],
    ['shoppingCashback','Shopping'],
    ['entertainmentCashback','Entertainment'],
    ['otherCashback','Other']
  ];

  const filteredCatalog = CARD_CATALOG.filter(card => {
    const text = `${card.cardName} ${card.bank} ${card.rewardSummary}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div>
      <h1 className="page-title">Credit Cards</h1>

      <div className="card mb-6">
        <h2>Recommended And Popular Cards</h2>
        <p className="text-muted mb-4">
          Search cards, compare annual fees and rewards, then load one into your owned-card form.
          {profile?.creditScore ? ` Recommendations are marked against your current credit score of ${profile.creditScore}.` : ''}
        </p>
        <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'end', marginBottom:16}}>
          <div className="form-group" style={{marginBottom:0}}>
            <label>Search Cards</label>
            <div style={{display:'grid', gridTemplateColumns:'40px 1fr', alignItems:'center', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8}}>
              <div style={{display:'flex', justifyContent:'center', color:'var(--accent2)', fontSize:'1rem'}}>🔍</div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by card name, bank, reward type, or fee..."
                style={{border:'none', background:'transparent'}}
              />
            </div>
          </div>
          <button
            className="btn btn-success"
            style={{whiteSpace:'nowrap'}}
            onClick={openCustomCardForm}
          >
            Add Custom Card
          </button>
        </div>
        <div style={{display:'grid', gap:12}}>
          {filteredCatalog.map(card => {
            const recommended = profile?.creditScore ? profile.creditScore >= card.minScore : false;
            return (
              <div key={card.cardName} style={{background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:16}}>
                <div className="flex justify-between items-center gap-3" style={{marginBottom:10}}>
                  <div>
                    <div style={{fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:'1.05rem'}}>{card.cardName}</div>
                    <div className="text-muted">{card.bank} · {card.annualFee === 0 ? 'No annual fee' : `$${card.annualFee}/yr`} · Recommended score {card.minScore}+</div>
                  </div>
                  <div style={{display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end'}}>
                    {recommended && <span className="badge badge-green">Recommended for you</span>}
                    {!recommended && profile?.creditScore && <span className="badge badge-warn">May need higher score</span>}
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => loadPreset(card)}>Add This Card</button>
                    <a className="btn btn-sm" style={{background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)', textDecoration:'none'}} href={card.officialUrl} target="_blank" rel="noreferrer">Official Info</a>
                  </div>
                </div>
                <div className="text-muted" style={{marginBottom:12}}>{card.rewardSummary}</div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
                  {cashbackFields.map(([field, label]) => (
                    <div key={field} style={{background:'var(--bg)', borderRadius:8, padding:'8px 12px', textAlign:'center'}}>
                      <div style={{fontSize:'0.7rem', color:'var(--muted)'}}>{label}</div>
                      <div style={{fontWeight:800, color:'var(--accent2)', fontSize:'1.1rem'}}>{card[field]}%</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filteredCatalog.length === 0 && <p className="empty-state">No matching cards found.</p>}
        </div>
        {search.trim().length >= 3 && (
          <div style={{marginTop:18}}>
            <h2 style={{marginBottom:12}}>Web Results</h2>
            {searchingWeb && <p className="text-muted">Searching the web for more card options...</p>}
            {!searchingWeb && webResults.length === 0 && (
              <p className="text-muted">No live web results found right now. Built-in catalog results are still available above.</p>
            )}
            <div style={{display:'grid', gap:10}}>
              {webResults.map(result => (
                <a
                  key={`${result.url}-${result.title}`}
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{display:'block', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:14, textDecoration:'none', color:'var(--text)'}}
                >
                  <div style={{fontWeight:700, marginBottom:6}}>{result.title}</div>
                  <div className="text-muted" style={{marginBottom:6}}>{result.snippet}</div>
                  <div style={{fontSize:'0.78rem', color:'var(--accent)'}}>{result.url}</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dash-grid" style={{alignItems:'start'}}>
        {showForm && (
          <div className="card" ref={formRef}>
            <h2>Card Details</h2>
            <form onSubmit={submit}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div className="form-group">
                  <label>Card Name</label>
                  <input name="cardName" value={form.cardName} onChange={handle} required placeholder="Chase Freedom" />
                </div>
                <div className="form-group">
                  <label>Bank</label>
                  <input name="bank" value={form.bank} onChange={handle} required placeholder="Chase" />
                </div>
                <div className="form-group">
                  <label>Last 4 Digits</label>
                  <input name="last4Digits" value={form.last4Digits} onChange={handle} maxLength={4} placeholder="1234" />
                </div>
                <div className="form-group">
                  <label>Annual Fee ($)</label>
                  <input name="annualFee" type="number" step="1" value={form.annualFee} onChange={handle} />
                </div>
              </div>

              <p style={{fontSize:'0.8rem', color:'var(--muted)', marginBottom:10}}>Rewards % by app category:</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
                {cashbackFields.map(([field, label]) => (
                  <div className="form-group" key={field}>
                    <label>{label}</label>
                    <input name={field} type="number" step="0.1" min="0" max="20" value={form[field]} onChange={handle} />
                  </div>
                ))}
              </div>

              <div style={{display:'flex', gap:10, marginTop:8}}>
                <button className="btn btn-primary" style={{flex:1}} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Card'}
                </button>
                <button type="button" className="btn btn-danger" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div>
          {cards.length === 0
            ? <div className="card"><p className="empty-state">No cards added yet. Pick one from the catalog above or add a custom card.</p></div>
            : cards.map(c => (
                <div className="card mb-6" key={c.id} style={{marginBottom:16}}>
                  <div className="flex justify-between items-center" style={{marginBottom:14}}>
                    <div>
                      <div style={{fontFamily:'Syne, sans-serif', fontWeight:800, fontSize:'1.05rem'}}>{c.cardName}</div>
                      <div className="text-muted">{c.bank} · ····{c.last4Digits} · {c.annualFee===0?'No annual fee':`$${c.annualFee}/yr`}</div>
                    </div>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(c.id)}>Remove</button>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
                    {cashbackFields.map(([field, label]) => (
                      <div key={field} style={{background:'var(--bg)', borderRadius:8, padding:'8px 12px', textAlign:'center'}}>
                        <div style={{fontSize:'0.7rem', color:'var(--muted)'}}>{label}</div>
                        <div style={{fontWeight:800, color:'var(--accent2)', fontSize:'1.1rem'}}>{c[field]}%</div>
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

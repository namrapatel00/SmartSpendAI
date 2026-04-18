import { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const PIE_COLORS = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#14b8a6'];

export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state">⏳ Loading your financial insights...</div>;
  if (!data)   return <div className="empty-state">Could not load dashboard. Make sure the backend is running.</div>;

  const pieData = [];
  const remainingSalary = parseFloat(data.remainingSalaryThisMonth);
  const overspent = remainingSalary < 0 ? Math.abs(remainingSalary) : 0;

  if (remainingSalary > 0) {
    pieData.push({ name: 'Remaining Salary', value: remainingSalary });
  }

  data.spendingBreakdown.forEach(s => {
    pieData.push({ name: s.category, value: parseFloat(s.totalSpent) });
  });

  if (overspent > 0) {
    pieData.push({ name: 'Over Salary', value: overspent });
  }

  const barData = data.cardRecommendations.map(r => ({
    category: r.category,
    cashback: parseFloat(r.bestCashbackPercent)
  }));

  return (
    <div>
      <h1 className="page-title">📊 Dashboard</h1>

      {/* ── KPI stats ── */}
      <div className="stats-grid">
        <div className={`stat-card ${remainingSalary >= 0 ? 'green' : 'danger'}`}>
          <div className="stat-label">Remaining Salary</div>
          <div className={`stat-value ${remainingSalary >= 0 ? 'green' : 'warn'}`}>
            ${Math.max(remainingSalary, 0).toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Spent This Month</div>
          <div className="stat-value blue">${data.totalSpentThisMonth.toFixed(2)}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Cashback Earned</div>
          <div className="stat-value green">${data.totalCashbackEarned.toFixed(2)}</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-label">Missed Cashback</div>
          <div className="stat-value warn">${data.potentialMissedCashback.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Budget Alerts</div>
          <div className="stat-value blue">
            {data.budgetStatuses.filter(b => b.isOverBudget).length} over
          </div>
        </div>
      </div>

      <div className="dash-grid">
        {/* ── Spending pie ── */}
        <div className="card">
          <h2>🍕 Spending Breakdown</h2>
          <p className="text-muted mb-4">Remaining salary is shown first, then this month's expense categories.</p>
          {pieData.length === 0
            ? <p className="empty-state">Add your salary and expenses to see breakdown</p>
            : <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={v=>`$${v.toFixed(2)}`}/>
                </PieChart>
              </ResponsiveContainer>
          }
        </div>

        {/* ── Best cashback bar ── */}
        <div className="card">
          <h2>💰 Best Cashback Per Category</h2>
          {barData.length === 0
            ? <p className="empty-state">Add a credit card to see recommendations</p>
            : <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{top:0,right:10,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="category" tick={{fill:'var(--muted)',fontSize:11}}/>
                  <YAxis tick={{fill:'var(--muted)',fontSize:11}} unit="%"/>
                  <Tooltip formatter={v=>`${v}%`}/>
                  <Bar dataKey="cashback" fill="#10b981" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
          }
        </div>
      </div>

      <div className="dash-grid">
        {/* ── AI Insights ── */}
        <div className="card">
          <h2>🤖 AI Spending Insights</h2>
          {data.spendingBreakdown.length === 0
            ? <p className="empty-state">Add expenses to unlock insights</p>
            : data.spendingBreakdown.map((s, i) => (
                <div className="insight-chip" key={i}>
                  <span className="icon">{categoryIcon(s.category)}</span>
                  <span>{s.insight}</span>
                </div>
              ))
          }
        </div>

        {/* ── Card recommendations ── */}
        <div className="card">
          <h2>🃏 Use This Card For...</h2>
          {data.cardRecommendations.length === 0
            ? <p className="empty-state">Add your credit cards in the Cards tab</p>
            : data.cardRecommendations.map((r, i) => (
                <div className="rec-card" key={i}>
                  <div className="rec-info">
                    <div className="rec-cat">{categoryIcon(r.category)} {r.category}</div>
                    <div className="rec-card-name">{r.bestCardBank} · {r.bestCardName}</div>
                  </div>
                  <div className="rec-pct">{r.bestCashbackPercent}%</div>
                </div>
              ))
          }
        </div>
      </div>

      {/* ── Budget status ── */}
      {data.budgetStatuses.length > 0 && (
        <div className="card mb-6">
          <h2>📋 Budget Status</h2>
          {data.budgetStatuses.map((b, i) => {
            const pct = Math.min((b.amountSpent / b.monthlyLimit) * 100, 100);
            const color = b.isOverBudget ? 'var(--danger)' : pct > 80 ? 'var(--warn)' : 'var(--accent2)';
            return (
              <div key={i} style={{marginBottom:16}}>
                <div className="flex justify-between items-center mb-4" style={{marginBottom:6}}>
                  <span style={{fontWeight:600}}>{b.category}</span>
                  <span style={{fontSize:'0.85rem', color: b.isOverBudget ? 'var(--danger)' : 'var(--muted)'}}>
                    ${b.amountSpent.toFixed(0)} / ${b.monthlyLimit.toFixed(0)}
                    {b.isOverBudget && ' ⚠️ Over!'}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width:`${pct}%`, background: color}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Suggested cards ── */}
      {data.suggestedCards.length > 0 && (
        <div className="card">
          <h2>✨ Suggested Cards For You</h2>
          <p className="text-muted mb-4">Based on your credit score & spending habits</p>
          {data.suggestedCards.map((c, i) => (
            <div className="sugg-card" key={i}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="sugg-name">{c.cardName}</div>
                  <div className="sugg-bank">{c.bank} · {c.annualFee === 0 ? 'No annual fee' : `$${c.annualFee}/yr fee`}</div>
                </div>
                <span className={`badge ${c.annualFee === 0 ? 'badge-green' : 'badge-blue'}`}>
                  {c.annualFee === 0 ? 'FREE' : `$${c.annualFee}/yr`}
                </span>
              </div>
              <div className="sugg-why">💡 {c.whyRecommended}</div>
              <div className="sugg-perk">🎁 {c.topPerk}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function categoryIcon(cat) {
  const icons = { Food:'🍕', Travel:'✈️', Bills:'⚡', Shopping:'🛍️', Entertainment:'🎬', Other:'💼' };
  return icons[cat] || '💼';
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', monthlyIncome: '', creditScore: 650
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const getErrorMessage = err => {
    if (!err.response) {
      return 'Cannot reach the backend API. Start the ASP.NET server and try again.';
    }

    const { data } = err.response;
    if (data?.message) return data.message;

    const validationErrors = data?.errors && Object.values(data.errors).flat();
    if (validationErrors?.length) return validationErrors[0];

    return 'Registration failed.';
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');

    const monthlyIncome = Number(form.monthlyIncome);
    const creditScore = Number(form.creditScore);

    if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0) {
      setError('Enter a valid monthly income.');
      setLoading(false);
      return;
    }

    try {
      const res = await register({
        ...form,
        monthlyIncome,
        creditScore
      });
      loginUser(res.data);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  const scoreColor = form.creditScore < 580 ? 'var(--danger)'
    : form.creditScore < 670 ? 'var(--warn)'
    : 'var(--accent2)';

  const scoreLabel = form.creditScore < 580 ? 'Poor'
    : form.creditScore < 670 ? 'Fair'
    : form.creditScore < 740 ? 'Good'
    : 'Excellent';

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-logo">💳 SmartSpend AI</div>
        <p className="auth-sub">Create your free account</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handle} required placeholder="Charudeshna Patel"/>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} required placeholder="you@email.com"/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} required placeholder="Min 6 characters"/>
          </div>
          <div className="form-group">
            <label>Monthly Income ($)</label>
            <input name="monthlyIncome" type="number" value={form.monthlyIncome} onChange={handle} required placeholder="3000"/>
          </div>
          <div className="form-group">
            <label style={{display:'flex', justifyContent:'space-between'}}>
              <span>Credit Score</span>
              <span style={{color: scoreColor, fontWeight:700}}>{form.creditScore} — {scoreLabel}</span>
            </label>
            <input name="creditScore" type="range" min="300" max="850"
              value={form.creditScore} onChange={handle}
              style={{padding:0, background:'transparent', border:'none', cursor:'pointer'}}/>
          </div>
          <button className="btn btn-primary btn-full" style={{marginTop:8}} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Free Account'}
          </button>
        </form>
        <p style={{marginTop:20, textAlign:'center', color:'var(--muted)', fontSize:'0.85rem'}}>
          Already have an account? <Link to="/login" style={{color:'var(--accent)'}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { getMyProfile, updateMyProfile } from '../services/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ monthlyIncome: '', creditScore: '' });

  const syncForm = data => {
    setForm({
      monthlyIncome: data.monthlyIncome.toString(),
      creditScore: data.creditScore.toString()
    });
  };

  useEffect(() => {
    getMyProfile()
      .then(r => {
        setProfile(r.data);
        syncForm(r.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async e => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data } = await updateMyProfile({
        monthlyIncome: Number(form.monthlyIncome),
        creditScore: Number(form.creditScore)
      });

      setProfile(data);
      syncForm(data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Profile</h1>
        <div className="card">
          <p className="text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <h1 className="page-title">Profile</h1>
        <div className="card">
          <p className="text-muted">Could not load profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Profile</h1>
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
          <h2 style={{ marginBottom: 0 }}>Account Details</h2>
          {!editing && (
            <button type="button" className="btn btn-sm btn-primary" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <div className="text-muted">Full Name</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{profile.name}</div>
          </div>
          <div>
            <div className="text-muted">Email</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{profile.email}</div>
          </div>
          {editing ? (
            <form onSubmit={save} style={{ display: 'grid', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Monthly Income</label>
                <input
                  name="monthlyIncome"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monthlyIncome}
                  onChange={handle}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Credit Score</label>
                <input
                  name="creditScore"
                  type="number"
                  min="300"
                  max="850"
                  value={form.creditScore}
                  onChange={handle}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    syncForm(profile);
                    setEditing(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div>
                <div className="text-muted">Monthly Income</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>${Number(profile.monthlyIncome).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted">Credit Score</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{profile.creditScore}</div>
              </div>
            </>
          )}
          <div>
            <div className="text-muted">Joined</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{new Date(profile.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

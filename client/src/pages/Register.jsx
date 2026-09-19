import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../store/authSlice';
import { Sparkles } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await dispatch(register(form)).unwrap();
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="lg:hidden flex items-center gap-2 font-display text-xl mb-8 text-ink">
        <Sparkles size={22} className="text-tutor" /> AI Study Companion
      </div>
      <h2 className="font-display text-2xl text-ink mb-1">Start learning smarter</h2>
      <p className="text-sm text-ink/60 mb-6">Create your account — it takes a minute.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink/80">Name</label>
          <input required className="input input-bordered w-full mt-1" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ada Lovelace" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/80">Email</label>
          <input type="email" required className="input input-bordered w-full mt-1" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/80">Password</label>
          <input type="password" required minLength={8} className="input input-bordered w-full mt-1" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
        </div>
        {error && <p className="text-sm text-mastery-low">{error}</p>}
        <button type="submit" disabled={loading} className="btn w-full bg-brand-500 hover:bg-brand-600 text-white border-none">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-6 text-center">
        Already have an account? <Link to="/login" className="text-brand-600 font-medium">Sign in</Link>
      </p>
    </div>
  );
}

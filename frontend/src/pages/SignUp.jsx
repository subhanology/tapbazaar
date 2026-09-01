import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
//import { useCart } from '../context/CartContext';

const SignUp = () => {
  const { signup } = useAuth();
  //const { mergeGuestCartIntoAccount } = useCart();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(form);
      //await mergeGuestCartIntoAccount();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed');
    }
  };

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 text-[22px] font-semibold tracking-heading text-ink">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-btn border border-border/60 px-4 py-3 text-sm outline-none focus:shadow-hover"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min. 8 characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-btn border border-border/60 px-4 py-3 text-sm outline-none focus:shadow-hover"
        />
        {error && <p className="text-xs text-error">{error}</p>}
        <button type="submit" className="w-full rounded-btn bg-ink py-3 text-sm font-medium text-white hover:shadow-hover">
          Sign up
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-secondary">
        Already have an account?{' '}
        <Link to="/signin" className="text-legal">
          Sign in
        </Link>
      </p>
    </main>
  );
};

export default SignUp;

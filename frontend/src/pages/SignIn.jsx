import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

/**
 * Renders the user sign-in page.
 * Authenticates the user credentials, merges any persistent guest cart items into their account cart, 
 * and redirects to the home page upon success.
 * 
 * @returns {JSX.Element} The SignIn component
 */
const SignIn = () => {
  const { signin } = useAuth();
  const { mergeGuestCartIntoAccount } = useCart();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /**
   * Handles user sign-in submission, error handling, guest cart merging, and routing.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signin(form);
      await mergeGuestCartIntoAccount();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed');
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="mb-1 font-display text-3xl font-semibold tracking-heading text-link">Welcome back</h1>
      <p className="mb-7 text-sm text-ink-secondary">Sign in to buy, sell, and track your listings.</p>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-btn border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-link focus:shadow-hover"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-btn border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-link focus:shadow-hover"
        />
        {error && <p className="rounded-btn bg-error-soft px-3 py-2 text-xs text-error">{error}</p>}
        <button type="submit" className="w-full rounded-btn bg-link py-3 text-sm font-medium text-white transition hover:bg-link-dark hover:shadow-hover">
          Sign in
        </button>
      </form>
      <p className="mt-5 text-sm text-ink-secondary">
        New here?{' '}
        <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">
          Create an account
        </Link>
      </p>
    </main>
  );
};

export default SignIn;
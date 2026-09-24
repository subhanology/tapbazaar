import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const SignUp = () => {
  const { signup } = useAuth();
  const { mergeGuestCartIntoAccount } = useCart();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup(form);
      await mergeGuestCartIntoAccount();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed");
    }
  };
  return (
    <main className="min-h-[calc(100vh-120px)] bg-[#faf9f7] px-5 py-12 md:py-20">
      <div className="mx-auto max-w-md">
        <div className="mb-7 text-center">
          <p className="section-kicker">Join the marketplace</p>
          <h1 className="mt-2 text-3xl font-extrabold text-ink">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            One account for shopping and selling on TapBazaar.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8">
          <label className="block text-xs font-bold text-ink">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-modern mt-2"
              placeholder="you@example.com"
            />
          </label>
          <label className="mt-4 block text-xs font-bold text-ink">
            Password
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-modern mt-2"
              placeholder="At least 8 characters"
            />
          </label>
          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-error">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary mt-5 w-full py-3">
            Create account
          </button>
          <p className="mt-5 text-center text-sm text-ink-secondary">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-bold text-primary hover:text-primary-dark"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
};
export default SignUp;

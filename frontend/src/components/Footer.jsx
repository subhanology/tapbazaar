import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="page-shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Link to="/" className="text-[20px] font-extrabold tracking-[-.05em] text-ink">
            tap<span className="text-primary">bazaar</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-ink-secondary">
            A simpler marketplace for finding great products and giving the things you own a
            second life.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink">Discover</p>
          <p className="mt-2 text-sm leading-6 text-ink-secondary">
            Search a growing catalog without the clutter.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/" className="text-ink-secondary hover:text-ink">Browse listings</Link></li>
            <li><Link to="/my-listings" className="text-ink-secondary hover:text-ink">My listings</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink">Sell simply</p>
          <p className="mt-2 text-sm leading-6 text-ink-secondary">
            Create listings, manage photos and keep control.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/products/new" className="text-ink-secondary hover:text-ink">Create a listing</Link></li>
            <li><Link to="/account" className="text-ink-secondary hover:text-ink">Your account</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink">Checkout securely</p>
          <p className="mt-2 text-sm leading-6 text-ink-secondary">
            A focused checkout experience powered by Stripe.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/cart" className="text-ink-secondary hover:text-ink">Your cart</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="page-shell flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-disabled sm:flex-row">
          <p>© {year} TapBazaar. All rights reserved.</p>
          <p>Built for buyers and sellers who want a simpler marketplace.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

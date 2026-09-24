import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const AccountMenu = () => {
  const { user, signout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignout = async () => { setOpen(false); await signout(); navigate('/'); };

  return (
    <div className="relative ml-1" ref={menuRef}>
      <button onClick={() => setOpen((v) => !v)} className="rounded-full p-0.5 ring-offset-2 hover:ring-2 hover:ring-primary/20" aria-label="Account menu" aria-expanded={open}><Avatar user={user} /></button>
      {open && (
        <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-card border border-border bg-white p-2 shadow-float">
          <div className="mb-1 flex items-center gap-3 rounded-btn bg-surface p-3">
            <Avatar user={user} size={40} />
            <div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{user?.email}</p><p className="text-xs text-ink-secondary">Your TapBazaar account</p></div>
          </div>
          <Link to="/account" onClick={() => setOpen(false)} className="block rounded-btn px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface">Account settings</Link>
          <Link to="/my-listings" onClick={() => setOpen(false)} className="block rounded-btn px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface">My listings</Link>
          <div className="my-1.5 border-t border-border" />
          <button onClick={handleSignout} className="block w-full rounded-btn px-3 py-2.5 text-left text-sm font-semibold text-error hover:bg-red-50">Sign out</button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;

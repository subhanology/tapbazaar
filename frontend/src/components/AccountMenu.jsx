import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

/**
 * Renders a dropdown menu for authenticated users, accessible via their avatar.
 * Provides navigation to account settings, user listings, and sign-out functionality.
 * 
 * @returns {JSX.Element} The AccountMenu component
 */
const AccountMenu = () => {
  const { user, signout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Closes the dropdown menu when a click is detected outside of its DOM node
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handles user sign-out by closing the menu, clearing auth context, 
   * and redirecting to the homepage.
   */
  const handleSignout = async () => {
    setOpen(false);
    await signout();
    navigate('/');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-full transition hover:shadow-hover"
        aria-label="Account menu"
      >
        <Avatar user={user} />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-card border border-border/40 bg-white py-2 shadow-card">
          <Link to="/account" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-ink hover:bg-surface">
            Account
          </Link>
          <Link to="/my-listings" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-ink hover:bg-surface">
            My Listings
          </Link>
          <div className="my-1 border-t border-border/30" />
          <button onClick={handleSignout} className="block w-full px-4 py-2 text-left text-sm text-error hover:bg-surface">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
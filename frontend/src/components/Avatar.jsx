/**
 * Renders a user's avatar. 
 * Displays the user's uploaded profile picture if available, 
 * falling back to an initial-based placeholder otherwise.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - The user object containing displayPicture and email
 * @param {number} [props.size=36] - The width and height of the avatar in pixels
 * @returns {JSX.Element} The Avatar component
 */
const Avatar = ({ user, size = 36 }) => {
  const initial = user?.email?.[0]?.toUpperCase() || '?';

  if (user?.displayPicture) {
    return (
      <img
        src={user.displayPicture}
        alt="Profile"
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-surface text-sm font-semibold text-ink"
    >
      {initial}
    </div>
  );
};

export default Avatar;
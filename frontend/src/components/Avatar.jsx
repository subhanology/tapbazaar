// Shows the user's Cloudinary photo if they have one, otherwise a clean
// initials circle (first letter of their email) so the navbar never looks broken.
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
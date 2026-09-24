import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import api from '../api/axios';

const MAX_SIZE_MB = 5;

/**
 * Renders the user account management page.
 * Allows users to select, preview, and upload a new profile picture.
 * 
 * @returns {JSX.Element} The Account component
 */
const Account = () => {
  const { user, updateUser } = useAuth();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Handles file selection from the input.
   * Validates the file type (must be an image) and size limit.
   * Generates a local object URL to display an immediate image preview.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event
   */
  const handleFileChange = (e) => {
    setError('');
    setSuccess('');
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  /**
   * Submits the selected profile picture to the server via FormData.
   * Updates the global authentication context with the returned user object upon success.
   */
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('displayPicture', file);

      const res = await api.put('/users/me/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(res.data.user);
      setSuccess('Profile picture updated.');
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="mb-6 text-[22px] font-semibold tracking-heading text-link">Account</h1>

      <div className="rounded-card border border-border/30 p-6 shadow-card">
        <div className="flex items-center gap-5">
          {preview ? (
            <img src={preview} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <Avatar user={user} size={80} />
          )}

          <div className="flex-1">
            <p className="text-sm font-medium text-ink">{user?.email}</p>
            <label className="mt-2 inline-block cursor-pointer text-sm text-link">
              Choose photo
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        {error && <p className="mt-4 text-xs text-error">{error}</p>}
        {success && <p className="mt-4 text-xs text-link-secondary">{success}</p>}

        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-5 w-full rounded-btn bg-primary py-3 text-sm font-medium text-white transition hover:shadow-hover disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Save profile picture'}
          </button>
        )}
      </div>

      <p className="mt-4 text-xs text-link-disabled">Images are stored securely on Cloudinary. Max {MAX_SIZE_MB}MB.</p>
    </main>
  );
};

export default Account;
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import api from "../api/axios";
const MAX_SIZE_MB = 5;
const Account = () => {
  const { user, updateUser } = useAuth();
  const [preview, setPreview] = useState(null),
    [file, setFile] = useState(null),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const handleFileChange = (e) => {
    setError("");
    setSuccess("");
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/"))
      return setError("Please choose an image file.");
    if (selected.size > MAX_SIZE_MB * 1024 * 1024)
      return setError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("displayPicture", file);
      const res = await api.put("/users/me/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(res.data.user);
      setSuccess("Profile picture updated successfully.");
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };
  return (
    <main className="page-shell py-10 md:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-7">
          <p className="section-kicker">Your profile</p>
          <h1 className="section-title mt-1">Account settings</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Keep your profile looking the way you want.
          </p>
        </div>
        <div className="surface-card overflow-hidden">
          <div className="bg-ink px-6 py-7 sm:px-8">
            <div className="flex items-center gap-4 text-white">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-white/10"
                />
              ) : (
                <Avatar user={user} size={80} />
              )}
              <div className="min-w-0">
                <p className="text-lg font-bold">{user?.email}</p>
                <p className="mt-1 text-sm text-white/55">TapBazaar member</p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm font-bold text-ink">Profile photo</p>
            <p className="mt-1 text-xs leading-5 text-ink-secondary">
              Use a clear square image. Maximum file size is {MAX_SIZE_MB}MB.
            </p>
            <label className="btn-secondary mt-4">
              Choose photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-error">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-4 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-success">
                {success}
              </p>
            )}
            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary mt-5 w-full py-3 disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Save profile picture"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
export default Account;

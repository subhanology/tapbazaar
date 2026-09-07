import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const MAX_IMAGES = 6;
const MAX_SIZE_MB = 5;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => {
      const p = res.data.product;
      setTitle(p.title);
      setPrice(String(p.price));
      setExistingImages(p.images || []);
      setLoading(false);
    });
  }, [id]);

  const handleFilesChange = (e) => {
    setError('');
    const selected = Array.from(e.target.files || []);

    if (selected.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }
    const tooBig = selected.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (tooBig) {
      setError(`Each image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', price);
      files.forEach((file) => formData.append('images', file));

      await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate(`/products/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="mx-auto max-w-lg px-6 py-10 text-ink-secondary">Loading...</main>;

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="mb-6 text-[22px] font-semibold tracking-heading text-ink">Edit listing</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-btn border border-border/60 px-4 py-3 text-sm outline-none focus:shadow-hover"
        />
        <input
          required
          type="number"
          min="0"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onWheel={(e) => e.target.blur()}
          className="w-full rounded-btn border border-border/60 px-4 py-3 text-sm outline-none focus:shadow-hover"
        />

        <div>
          <p className="mb-2 text-xs text-ink-secondary">Current photos</p>
          <div className="grid grid-cols-3 gap-2">
            {existingImages.map((img) => (
              <img key={img.publicId} src={img.url} alt="" className="aspect-square w-full rounded-btn object-cover" />
            ))}
          </div>
        </div>

        <div>
          <label className="inline-block cursor-pointer rounded-btn border border-border/60 px-4 py-3 text-sm text-ink hover:bg-surface">
            Replace photos (optional, up to {MAX_IMAGES})
            <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
          </label>
          <p className="mt-1 text-xs text-ink-disabled">
            Uploading new photos here replaces ALL current photos — it doesn't add to them.
          </p>
        </div>

        {previews.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-ink-secondary">New photos (will replace current ones on save)</p>
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" className="aspect-square w-full rounded-btn object-cover" />
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-error">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-btn bg-rausch py-3 text-sm font-medium text-white transition hover:shadow-hover disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </main>
  );
};

export default EditProduct;
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import ImageSlotUploader from '../components/ImageSlotUploader';
import { compressImage } from '../utils/compressImage';

const MAX_IMAGES = 6;
const MAX_SIZE_MB = 8;
const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Books', 'Sports & Outdoors', 'Vehicles', 'Other'];

const emptySlots = () => Array.from({ length: MAX_IMAGES }, () => ({ file: null, preview: null, existingUrl: null, existingPublicId: null }));

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState(emptySlots());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data.product;
        setTitle(p.title);
        setPrice(String(p.price));
        setCategory(p.category || '');
        setDescription(p.description || '');

        const loaded = emptySlots();
        (p.images || []).forEach((img, i) => {
          if (i < MAX_IMAGES) {
            loaded[i] = { file: null, preview: null, existingUrl: img.url, existingPublicId: img.publicId };
          }
        });
        setSlots(loaded);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load listing'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelect = (index, file) => {
    setError('');
    if (!file.type.startsWith('image/')) return setError('Please choose an image file.');
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return setError(`Each image must be smaller than ${MAX_SIZE_MB}MB.`);

    setSlots((prev) => {
      const next = [...prev];
      // A fresh upload replaces whatever was in this slot, existing or not
      next[index] = { file, preview: URL.createObjectURL(file), existingUrl: null, existingPublicId: null };
      return next;
    });
  };

  const handleRemove = (index) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { file: null, preview: null, existingUrl: null, existingPublicId: null };
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const newFiles = slots.map((s) => s.file).filter(Boolean);
      const keptImages = slots
        .filter((s) => s.existingUrl && s.existingPublicId)
        .map((s) => ({ url: s.existingUrl, publicId: s.existingPublicId }));

      const compressedFiles = await Promise.all(newFiles.map(compressImage));

      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('existingImages', JSON.stringify(keptImages));
      compressedFiles.forEach((file) => formData.append('images', file));

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

  if (loading) {
    return (
      <main className="page-shell py-16">
        <div className="mx-auto max-w-2xl animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-surface-strong" />
          <div className="h-96 rounded-card bg-surface-strong" />
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell py-10 md:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-7">
          <p className="section-kicker">Seller dashboard</p>
          <h1 className="section-title mt-1">Edit listing</h1>
        </div>

        <form onSubmit={handleSubmit} className="surface-card p-5 sm:p-7">
          <label className="block text-xs font-bold text-ink">
            Item title
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input-modern mt-2" />
          </label>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block text-xs font-bold text-ink">
              Price
              <input required type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} onWheel={(e) => e.currentTarget.blur()} className="input-modern mt-2" />
            </label>
            <label className="block text-xs font-bold text-ink">
              Category
              <select required value={category} onChange={(e) => setCategory(e.target.value)} className="input-modern mt-2">
                <option value="" disabled>Choose a category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <label className="mt-5 block text-xs font-bold text-ink">
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} className="input-modern mt-2 resize-none" />
          </label>

          <div className="mt-5">
            <p className="text-xs font-bold text-ink">Product photos</p>
            <p className="mt-1 text-xs text-ink-secondary">Tap a box to replace it, or the ✕ to remove it — untouched boxes keep their current photo.</p>
            <div className="mt-2">
              <ImageSlotUploader slots={slots} onSelect={handleSelect} onRemove={handleRemove} maxImages={MAX_IMAGES} disabled={submitting} />
            </div>
          </div>

          {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-error">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full py-3.5 disabled:opacity-50">
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default EditProduct;

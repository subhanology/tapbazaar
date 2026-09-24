import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ImageSlotUploader from '../components/ImageSlotUploader';
import { compressImage } from '../utils/compressImage';

const MAX_IMAGES = 6;
const MAX_SIZE_MB = 8; // pre-compression limit; files are shrunk before upload
const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Books', 'Sports & Outdoors', 'Vehicles', 'Other'];

const emptySlots = () => Array.from({ length: MAX_IMAGES }, () => ({ file: null, preview: null }));

const CreateProduct = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState(emptySlots());
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (index, file) => {
    setError('');
    if (!file.type.startsWith('image/')) return setError('Please choose an image file.');
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return setError(`Each image must be smaller than ${MAX_SIZE_MB}MB.`);

    setSlots((prev) => {
      const next = [...prev];
      next[index] = { file, preview: URL.createObjectURL(file) };
      return next;
    });
  };

  const handleRemove = (index) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { file: null, preview: null };
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const chosenFiles = slots.map((s) => s.file).filter(Boolean);
    if (chosenFiles.length === 0) return setError('At least one product image is required.');

    setSubmitting(true);
    try {
      // Shrink every photo client-side first — this is what actually makes
      // uploads fast, since there's far less data to send afterward.
      const compressedFiles = await Promise.all(chosenFiles.map(compressImage));

      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('description', description);
      compressedFiles.forEach((file) => formData.append('images', file));

      const res = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate(`/products/${res.data.product._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell py-10 md:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-7">
          <p className="section-kicker">Start selling</p>
          <h1 className="section-title mt-1">Create a listing</h1>
          <p className="section-copy mt-2">Add clear details and good photos so buyers know exactly what they're getting.</p>
        </div>

        <form onSubmit={handleSubmit} className="surface-card p-5 sm:p-7">
          <label className="block text-xs font-bold text-ink">
            Item title
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input-modern mt-2" placeholder="e.g. Wireless headphones" />
          </label>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block text-xs font-bold text-ink">
              Price
              <input required type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} onWheel={(e) => e.currentTarget.blur()} className="input-modern mt-2" placeholder="0.00" />
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
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
              className="input-modern mt-2 resize-none"
              placeholder="Condition, dimensions, what's included — anything a buyer would want to know."
            />
          </label>

          <div className="mt-5">
            <p className="text-xs font-bold text-ink">Product photos</p>
            <p className="mt-1 text-xs text-ink-secondary">Add up to {MAX_IMAGES} photos — one per box.</p>
            <div className="mt-2">
              <ImageSlotUploader slots={slots} onSelect={handleSelect} onRemove={handleRemove} maxImages={MAX_IMAGES} disabled={submitting} />
            </div>
          </div>

          {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-error">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full py-3.5 disabled:opacity-50">
            {submitting ? 'Publishing…' : 'Publish listing'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default CreateProduct;

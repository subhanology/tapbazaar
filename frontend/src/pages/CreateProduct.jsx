import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MAX_IMAGES = 6;
const MAX_SIZE_MB = 5;

const CreateProduct = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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

    if (files.length === 0) {
      setError('At least one product image is required.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', price);
      files.forEach((file) => formData.append('images', file));

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
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="mb-6 text-[22px] font-semibold tracking-heading text-ink">List an item</h1>

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
          <label className="inline-block cursor-pointer rounded-btn border border-border/60 px-4 py-3 text-sm text-ink hover:bg-surface">
            Choose photos (up to {MAX_IMAGES})
            <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
          </label>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <img key={i} src={src} alt="" className="aspect-square w-full rounded-btn object-cover" />
            ))}
          </div>
        )}

        {error && <p className="text-xs text-error">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-btn bg-rausch py-3 text-sm font-medium text-white transition hover:shadow-hover disabled:opacity-50"
        >
          {submitting ? 'Publishing...' : 'Publish listing'}
        </button>
        <p className="text-xs text-ink-disabled">A unique serial number is generated automatically.</p>
      </form>
    </main>
  );
};

export default CreateProduct;
// Six independent upload slots instead of one <input multiple> — this is the
// actual fix for the "choosing a 4th photo wipes out the first 3" bug, since
// each box owns its own file input and only ever touches its own slot.
const ImageSlotUploader = ({ slots, onSelect, onRemove, maxImages = 6, disabled = false }) => (
  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
    {Array.from({ length: maxImages }).map((_, i) => {
      const slot = slots[i];
      const preview = slot?.preview || slot?.existingUrl;

      return (
        <div key={i} className="aspect-square">
          {preview ? (
            <div className="group relative h-full w-full overflow-hidden rounded-xl border border-border">
              <img src={preview} alt={`Product photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                disabled={disabled}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
                aria-label={`Remove photo ${i + 1}`}
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d4d4d8] bg-surface text-ink-disabled transition hover:border-primary hover:bg-primary-soft hover:text-primary">
              <span className="text-2xl leading-none">+</span>
              <span className="mt-1 text-[10px] font-semibold">Photo {i + 1}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={disabled}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onSelect(i, file);
                  e.target.value = ''; // allows re-selecting the same file later
                }}
              />
            </label>
          )}
        </div>
      );
    })}
  </div>
);

export default ImageSlotUploader;

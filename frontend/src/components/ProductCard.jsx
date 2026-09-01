import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => (
  <Link
    to={`/products/${product._id}`}
    className="group block overflow-hidden rounded-card bg-white shadow-card transition hover:shadow-hover"
  >
    <div className="aspect-[4/3] w-full overflow-hidden bg-surface">
      {product.images?.[0] ? (
        <img
          src={product.images[0]}
          alt={product.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-ink-secondary">No image</div>
      )}
    </div>
    <div className="space-y-1 p-4">
      <h3 className="truncate text-base font-semibold tracking-subheading text-ink">{product.title}</h3>
      <p className="text-sm text-ink-secondary">${product.price?.toFixed(2)}</p>
      <p className="text-xs text-ink-disabled">{product.serialNumber}</p>
    </div>
  </Link>
);

export default ProductCard;

/**
 * Renders a numeric stepper component for adjusting quantities.
 * Enforces minimum and maximum boundaries and can be disabled.
 * 
 * @param {Object} props - Component props
 * @param {number} props.quantity - The current quantity value
 * @param {Function} props.onChange - Callback function triggered when the quantity changes
 * @param {number} [props.min=1] - The minimum allowable quantity
 * @param {number} [props.max=99] - The maximum allowable quantity
 * @param {boolean} [props.disabled=false] - Whether the stepper is interactive
 * @returns {JSX.Element} The QuantityStepper component
 */
const QuantityStepper = ({ quantity, onChange, min = 1, max = 99, disabled = false }) => {
  const decrease = () => onChange(Math.max(min, quantity - 1));
  const increase = () => onChange(Math.min(max, quantity + 1));

  return (
    <div className="inline-flex items-center rounded-btn border border-border">
      <button
        type="button"
        onClick={decrease}
        disabled={disabled || quantity <= min}
        aria-label="Decrease quantity"
        className="flex h-9 w-9 items-center justify-center text-ink transition hover:bg-surface disabled:opacity-30"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium text-ink" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center text-ink transition hover:bg-surface disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
};

export default QuantityStepper;
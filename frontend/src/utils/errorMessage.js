const KNOWN_SAFE_MESSAGES = [
  'An account with this email already exists.',
  'Invalid email or password',
  'You cannot comment on your own product.',
  'You cannot add your own product to the cart.',
  'You can only edit your own products.',
  'You can only delete your own products.',
  'You can only edit your own comments.',
  'You can only delete your own comments.',
  'At least one product image is required',
  'No image file was provided',
  'Please choose an image file.',
  'This promo code has expired',
  'Invalid promo code',
  'Invalid or expired promo code',
  'Your cart is empty',
];

const DEFAULT_FALLBACK = "Something went wrong on our end. Please try again in a moment.";

export const getFriendlyError = (err, fallback = DEFAULT_FALLBACK) => {
  if (!err?.response) {
    return "Can't reach the server right now. Check your connection and try again.";
  }

  const serverMessage = err.response.data?.message;
  const isKnownSafe = serverMessage && KNOWN_SAFE_MESSAGES.some((safe) => serverMessage.startsWith(safe));
  if (isKnownSafe) return serverMessage;

  switch (err.response.status) {
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "We couldn't find what you were looking for.";
    case 413:
      return 'That file is too large.';
    case 429:
      return 'Too many attempts. Please wait a few minutes and try again.';
    default:
      return fallback;
  }
};
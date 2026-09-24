// Resizes and re-encodes an image in the browser before it's ever uploaded.
// Phone-camera photos are often 3-8MB at 3000px+ resolution — shrinking to a
// sane max dimension and re-encoding as JPEG cuts that down dramatically,
// which is the real fix for slow uploads (less data to send, not a faster
// server). Runs entirely on canvas, no extra dependency needed.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > height && width > MAX_DIMENSION) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else if (height > MAX_DIMENSION) {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Could not process that image.'));
          resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read that image file.'));
    };

    img.src = objectUrl;
  });

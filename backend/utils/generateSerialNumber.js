/**
 * Generates a unique serial number in the form PRD-YYYYMMDD-XXXXX
 * and guards against the (rare) collision by checking the DB before returning.
 */
const generateSerialNumber = async (ProductModel) => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  let serial;
  let exists = true;

  while (exists) {
    const randomPart = Math.floor(10000 + Math.random() * 90000);
    serial = `PRD-${datePart}-${randomPart}`;
    exists = await ProductModel.exists({ serialNumber: serial });
  }

  return serial;
};

module.exports = { generateSerialNumber };

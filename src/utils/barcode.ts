export function generateBarcode(): string {
  // Generate a unique barcode (in a real app, this would be from a server)
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}${random}`.padStart(13, '0');
}

export function generateTicketNumber(): string {
  const random = Math.floor(Math.random() * 1000000);
  return `TKT-${random.toString().padStart(6, '0')}`;
}


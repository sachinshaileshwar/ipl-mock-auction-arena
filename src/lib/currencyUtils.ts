/**
 * Formats currency value stored in crores to display format
 * @param crores - Value in crores
 * @returns Formatted string (e.g., "2.00 Cr", "50 Lakhs")
 */
export const formatCurrency = (crores: number): string => {
  if (crores >= 1) {
    return `${crores.toFixed(2)} Cr`;
  } else {
    const lakhs = crores * 100;
    return `${lakhs.toFixed(0)} Lakhs`;
  }
};

/**
 * Formats currency for bid display (always in crores)
 * @param crores - Value in crores
 * @returns Formatted string (e.g., "5.00 Crs")
 */
export const formatBidAmount = (crores: number): string => {
  return `${crores.toFixed(2)} Crs`;
};

/**
 * Converts lakhs to crores for storage
 * @param lakhs - Value in lakhs
 * @returns Value in crores
 */
export const lakhsToCrores = (lakhs: number): number => {
  return lakhs / 100;
};

/**
 * Parses currency string from CSV (handles both lakhs and crores)
 * Examples: "50 Lakhs", "2.00 Cr", "200", "2 crores"
 * @param value - Currency string to parse
 * @returns Value in crores
 */
export const parseCurrency = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  
  const cleanValue = value.trim().toLowerCase();
  const numMatch = cleanValue.match(/[\d.]+/);
  if (!numMatch) return 0;
  
  const num = parseFloat(numMatch[0]);
  
  // Check if it's in crores
  if (cleanValue.includes('cr') || cleanValue.includes('crore')) {
    return num;
  }
  
  // Check if it's in lakhs
  if (cleanValue.includes('lakh') || cleanValue.includes('lac')) {
    return num / 100; // Convert lakhs to crores
  }
  
  // If no unit specified, assume lakhs and convert to crores
  return num / 100;
};

// Legacy function for backwards compatibility
export const formatToLakhs = formatCurrency;

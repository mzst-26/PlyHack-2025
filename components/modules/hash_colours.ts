import crypto from "crypto";

/**
 * Hash a string into a normalized float [0, 1].
 */
const stringToNumber = (str: string): number => {
  const hash = crypto.createHash("md5").update(str).digest("hex");
  const number = parseInt(hash.substring(0, 8), 16); // Use a portion of the hash
  return number / 0xffffffff; // Normalize to [0, 1]
};

/**
 * Generate a hex color based on an array of strings.
 */
export const generateColor = (strings: string[]): string => {
  console.log("Input strings:", strings);

  // Convert each string to a number with positional influence
  const numbers = strings.map((str, index) => {
    const baseHash = stringToNumber(str);
    const positionHash = stringToNumber(index.toString());
    return (baseHash + positionHash) % 1; // Combine base and position
  });

  // Aggregate the numbers with a weighted sum (more weight to later strings)
  const aggregatedValue =
    numbers.reduce((sum, num, index) => sum + num * (index + 1), 0) /
    (numbers.length * (numbers.length + 1) / 2);

  // Map aggregated value to RGB using nonlinear scaling
  const factor = 2.0; // Increase the scaling factor for more variation
  const adjustedValue = Math.pow(aggregatedValue, factor);

  const r = Math.floor((Math.sin(adjustedValue * 2 * Math.PI) + 1) * 127.5);
  const g = Math.floor((Math.sin((adjustedValue + 1 / 3) * 2 * Math.PI) + 1) * 127.5);
  const b = Math.floor((Math.sin((adjustedValue + 2 / 3) * 2 * Math.PI) + 1) * 127.5);

  console.log("RGB values:", r, g, b);

  // Return the hex color
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};
/** Convert integer paisa to a display string like `Rs. 1,250`. */
export function formatPaisa(paisa: number): string {
  const rupees = Math.round(paisa) / 100;
  return `Rs. ${rupees.toLocaleString("en-PK", {
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  })}`;
}

/** Convert rupees (possibly fractional) to integer paisa. */
export function rupeesToPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Convert integer paisa to rupees number. */
export function paisaToRupees(paisa: number): number {
  return paisa / 100;
}

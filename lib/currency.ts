export function formatPaisa(paisa: number): string {
  const rupees = Math.round(paisa) / 100;
  return `Rs. ${rupees.toLocaleString("en-PK", {
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  })}`;
}

export function rupeesToPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paisaToRupees(paisa: number): number {
  return paisa / 100;
}

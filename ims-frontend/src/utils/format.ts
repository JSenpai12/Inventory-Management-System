// FILE: src/utils/format.ts
// PURPOSE: small functions that turn raw values into display text (money, dates).
// WHAT TO DO: call these instead of building strings by hand ('$' + price), so a formatting change happens in ONE place.

/** 89.5 -> "$89.50". Pass 0 as fractionDigits for whole dollars: 12345.6 -> "$12,346". */
export function formatMoney(amount: number, fractionDigits = 2): string {
  return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })
}

/** Today's date as "YYYY-MM-DD", the same format used by <input type="date"> and the mock data. */
export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

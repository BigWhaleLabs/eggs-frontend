const formatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
})

export function formatCompactNumber(value: number): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }

  return formatter.format(value)
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
  
  // Remove spaces or non-breaking spaces (e.g. "₹ 4,20,000" -> "₹4,20,000")
  return formatted.replace(/\u00a0/g, '').replace(/\s+/g, '').trim()
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  
  const day = d.getDate()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  
  return `${day} ${month} ${year}`
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const isFuture = diffMs < 0
  const absDiffMs = Math.abs(diffMs)
  
  const diffMins = Math.floor(absDiffMs / 60000)
  const diffHours = Math.floor(absDiffMs / 3600000)
  const diffDays = Math.floor(absDiffMs / 86400000)

  if (diffMins < 1) {
    return isFuture ? 'in a moment' : 'just now'
  }
  
  let unit = ''
  let value = 0
  
  if (diffMins < 60) {
    value = diffMins
    unit = value === 1 ? 'minute' : 'minutes'
  } else if (diffHours < 24) {
    value = diffHours
    unit = value === 1 ? 'hour' : 'hours'
  } else if (diffDays < 30) {
    value = diffDays
    unit = value === 1 ? 'day' : 'days'
  } else {
    return formatDate(d)
  }
  
  return isFuture ? `in ${value} ${unit}` : `${value} ${unit} ago`
}

export function truncate(str: string, length: number): string {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getInitials(name: string): string {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  const first = parts[0][0] || ''
  const last = parts[parts.length - 1][0] || ''
  return (first + last).toUpperCase()
}

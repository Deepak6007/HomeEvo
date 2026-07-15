export const redirect = (url: string) => {
  if (typeof window !== 'undefined') {
    window.location.href = url
  }
}

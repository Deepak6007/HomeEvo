import { TokenPayload } from "@/types"

/**
 * Decodes the payload of a JWT token on the client-side/server-side.
 * This does NOT verify the signature, only extracts the JSON payload.
 * Works inside browser, Node, and edge environments.
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payloadB64 = parts[1]
    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/")
    
    // Decode base64 bytes to standard UTF-8 string
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    
    const jsonStr = new TextDecoder().decode(bytes)
    return JSON.parse(jsonStr) as TokenPayload
  } catch (error) {
    console.error("Failed to decode JWT token:", error)
    return null
  }
}

/**
 * Extracts the expiration Date from a JWT token.
 */
export function getTokenExpiry(token: string): Date | null {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return null
  return new Date(decoded.exp * 1000)
}

/**
 * Determines whether a JWT token has expired.
 */
export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token)
  if (!expiry) return true
  return expiry.getTime() < Date.now()
}

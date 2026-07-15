"use client"

import * as React from "react"
import { BlueprintRequest, BlueprintResponse } from "../lib/validators/blueprint"

export function useBlueprint() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isStreaming, setIsStreaming] = React.useState<boolean>(false)
  const [progress, setProgress] = React.useState<number>(0)
  const [rawChunks, setRawChunks] = React.useState<string>('')
  const [data, setData] = React.useState<BlueprintResponse | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const generate = React.useCallback(async (formData: BlueprintRequest) => {
    // Reset state
    setIsLoading(true)
    setIsStreaming(false)
    setProgress(0)
    setRawChunks('')
    setData(null)
    setError(null)
    
    try {
      const response = await fetch('/api/blueprint/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        let errMsg = 'Failed to generate blueprint'
        try {
          const err = await response.json()
          errMsg = err.error || err.message || errMsg
        } catch {
          // ignore parsing error, use default message
        }
        throw new Error(errMsg)
      }
      
      if (!response.body) throw new Error('No response stream')
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let charCount = 0
      const ESTIMATED_TOTAL_CHARS = 3000 // rough estimate for progress bar
      
      setIsLoading(false)
      setIsStreaming(true)
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = decoder.decode(value, { stream: true })
        // Parse SSE lines
        const lines = text.split('\n')
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim() // remove "data: " and trim
          
          if (payload === '[DONE]') {
            // Final JSON complete — parse it
            try {
              const parsed = JSON.parse(accumulated) as BlueprintResponse
              setData(parsed)
              setProgress(100)
            } catch (err) {
              console.error("JSON parsing error on [DONE]:", err, accumulated)
              setError('Blueprint data was corrupted during streaming. Please try again.')
            }
            setIsStreaming(false)
            return
          }
          
          try {
            const parsed = JSON.parse(payload)
            if (parsed.error) {
              setError(parsed.error)
              setIsStreaming(false)
              return
            }
            if (parsed.chunk) {
              accumulated += parsed.chunk
              charCount += parsed.chunk.length
              // Update progress based on estimated total length
              const newProgress = Math.min(
                Math.round((charCount / ESTIMATED_TOTAL_CHARS) * 90),
                90 // cap at 90% — last 10% is for parse + render
              )
              setProgress(newProgress)
              setRawChunks(accumulated)
            }
          } catch {
            // Ignore malformed SSE lines or partial chunks during parsing
          }
        }
      }
    } catch (err) {
      console.error("Error in useBlueprint generate:", err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsLoading(false)
      setIsStreaming(false)
    }
  }, [])

  const reset = React.useCallback(() => {
    setIsLoading(false)
    setIsStreaming(false)
    setProgress(0)
    setRawChunks('')
    setData(null)
    setError(null)
  }, [])

  return { generate, isLoading, isStreaming, progress, rawChunks, data, error, reset }
}
